"use client";

import Link from "next/link";
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader, Checkbox, Spacer, Switch } from "@nextui-org/react";
import { type CSSProperties, useMemo, useState } from "react";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, type DragEndEvent, type DragStartEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, DragOverlay, type DraggableAttributes, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { CSS } from '@dnd-kit/utilities';
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type Node = RouterOutputs['node']['listChildren'][number];

type NodeListProps = {
  parentId: string;
  limit?: number;
}

export function NodeList({ parentId, limit }: NodeListProps) {
  // Hooks for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: { y: 10 },
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: { x: 3, y: 3 },
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [activeNode, setActiveNode] = useState<Node | undefined>(undefined);

  // Hooks for API calls
  const utils = api.useUtils();
  const [showCompleted, setShowCompleted] = useState(false);
  const getParentQuery = api.node.get.useQuery({ id: parentId });
  const parent = getParentQuery?.data?.[0];
  const listChildrenInput = { parentId, limit };
  const listChildrenQuery = api.node.listChildren.useQuery(listChildrenInput);
  const children = useMemo(() => listChildrenQuery.data ?? [], [listChildrenQuery.data]);
  const childrenById = useMemo(() => {
    const childrenDict: Record<string, Node> = {};
    for (const child of children) {
      childrenDict[child.id] = child;
    }
    return childrenDict;
  }, [children]);
  const reorderChildren = api.node.reorderChildren.useMutation({
    async onMutate(vars) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.node.listChildren.cancel(listChildrenInput);

      // Get the data from the queryCache
      const prevData = utils.node.listChildren.getData(listChildrenInput);

      // Optimistically update the data
      utils.node.listChildren.setData(listChildrenInput, (prevData) => {
        const children = prevData ?? [];
        const childrenDict: Record<string, Node> = {};
        for (const child of children) {
          childrenDict[child.id] = child;
        }

        // Reorder the children
        const newData = [];
        for (const id of vars.childrenIds) {
          const child = childrenDict[id];
          if (!child) {
            throw new Error(`Missing child with id: ${id}`);
          }
          newData.push(child)
        }
        return newData;
      });

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    async onError(_err, _newData, context) {
      // If the mutation fails, use the context returned from onMutate to roll back
      utils.node.listChildren.setData(listChildrenInput, context?.prevData);
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.node.listChildren.invalidate({ parentId, limit });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveNode(childrenById[event.active.id]);
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over === null) {
      return;
    }
    if (active.id === over.id) {
      return;
    }

    const oldIndex = children.map(n => n.id).indexOf(active.id.toString());
    const newIndex = children.map(n => n.id).indexOf(over.id.toString());
    const reordered = arrayMove(children, oldIndex, newIndex);
    setActiveNode(undefined);
    reorderChildren.mutate({ parentId, childrenIds: reordered.map(c => c.id) })
  }
  const { isLoading, isError, error } = listChildrenQuery;

  if (isError) {
    return <div>Error occured: {JSON.stringify(error)}</div>
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log("parent", parent);

  return (
    <div>
      {parent && !!parent.completedNodeId && parent.nodeType === "default" && (
        <Switch
          isSelected={showCompleted}
          onValueChange={setShowCompleted}
          className="mb-3"
        >
          <p>Show completed</p>
        </Switch>
      )}
      {parent && parent.completedNodeId !== null && showCompleted ? (
        <NodeList parentId={parent.completedNodeId} />
      ) : (
        children.length === 0 ? (
          <p>This list is empty.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={children} strategy={verticalListSortingStrategy}>
              {
                children.map(node => (
                  <SortableItem key={node.id} node={node} parentId={parentId} />
                ))
              }
            </SortableContext>
            <DragOverlay>
              {activeNode ? <Item node={activeNode} parentId={parentId} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )
      )}
    </div>
  )
}

type SortableItemProps = {
  node: Node;
  parentId: string;
}

function SortableItem({ parentId, node }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({ id: node.id });
  const style: CSSProperties = {
    opacity: isDragging ? 0.5 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Item setNodeRef={setNodeRef}
      style={style} attributes={attributes} listeners={listeners}
      node={node} parentId={parentId} disablePreview={isDragging}
    />
  )
}

type ItemProps = {
  parentId: string;
  node: Node;
  disablePreview?: boolean;
  style?: CSSProperties;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  setNodeRef?: (node: HTMLElement | null) => void;
  isOverlay?: boolean;
}

function Item({ parentId, node, style, attributes, listeners, setNodeRef, disablePreview, isOverlay }: ItemProps) {
  const [previewChildrenBase, setPreviewChildren] = useState(false);
  const previewChildren = previewChildrenBase && !disablePreview;
  const utils = api.useUtils();
  const getParentQuery = api.node.get.useQuery({ id: parentId });
  const parent = getParentQuery?.data?.[0];
  const deleteMutation = api.node.delete.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
    },
  });
  const deleteNode = () => {
    deleteMutation.mutate({ parentId, id: node.id });
  }
  const completeMutation = api.node.complete.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
      await utils.node.get.invalidate({ id: parentId });
    },
  });
  const completeNode = () => {
    completeMutation.mutate({ parentId, id: node.id });
  }
  const handleCheckboxValueChange = (isSelected: boolean) => {
    if (!isSelected) {
      console.log("TODO move back to original list");
      return;
    }

    completeNode();
  }

  return (
    <div
      className="w-full mb-4"
      ref={setNodeRef}
      style={{ ...style, touchAction: "manipulation", userSelect: "none" }}
      {...attributes}
      {...listeners}
    >
      <Card style={{ boxShadow: isOverlay ? "4px 8px 16px rgba(0, 0,0, 0.5)" : undefined }}>
        <CardBody className="flex flex-row gap-2">
          {node.childrenIds.length === 0 ? (
            <Checkbox isSelected={parent?.nodeType === "completed"} onValueChange={handleCheckboxValueChange} />
          ) : (
            <Button isIconOnly aria-label={previewChildren ? "Collapse" : "Expand"} onPress={() => !!setPreviewChildren && setPreviewChildren(!previewChildren)}>
              {previewChildren ? <CollapseIcon /> : <ExpandIcon />}
            </Button>
          )}
          {!!node.url && (
            <Link href={node.url} target="_blank" className="flex-grow basis-0">
              {!!node.urlPreviewImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`Image of ${node.name}`}
                  src={node.urlPreviewImageUrl}
                />
              ) : !!node.urlPreviewDescription ? (
                <p>{node.urlPreviewDescription}</p>
              ) : (
                <p>Open link</p>
              )}
            </Link>
          )}
          <Link href={`/node/${node.id}`} className="flex-grow basis-0">
            <h3 className="text-md font-bold">{node.name}</h3>
            <Spacer x={4} />
          </Link>
          <Button isIconOnly aria-label="Delete" onPress={() => deleteNode()}>
            <DeleteIcon />
          </Button>
        </CardBody>
      </Card>
      <div className="ml-12 mt-4">
        {previewChildren && (
          <NodeList parentId={node.id} limit={5} />
        )}
      </div>
    </div>
  )
}

function CollapseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
