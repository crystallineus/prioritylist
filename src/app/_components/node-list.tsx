"use client";

import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion"
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import { CreateNode } from "~/app/_components/create-node";

type Node = RouterOutputs['node']['listChildren'][number];

type NodeListProps = {
  parentId: string;
}

export function NodeList({ parentId }: NodeListProps) {
  const utils = api.useUtils();
  const orderedNodesQuery = api.node.listChildren.useQuery({ parentId });
  const updateChildren = api.node.updateChildren.useMutation({
    async onMutate(vars) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.node.listChildren.cancel();

      // Get the data from the queryCache
      const prevData = utils.node.listChildren.getData();

      // Optimistically update the data
      utils.node.listChildren.setData({ parentId }, (prevData) => {
        const children = prevData ?? [];
        const childrenDict: Record<string, Node> = {};
        for (const child of children) {
          childrenDict[child.id] = child;
        }
        console.log("----")
        console.log("prevOrder", children.map(c => c.id));
        console.log("childrenDict", childrenDict);

        // Reorder the children
        const newData = [];
        for (const id of vars.childrenIds) {
          const child = childrenDict[id];
          if (!child) {
            throw new Error(`Missing child with id: ${id}`);
          }
          newData.push(child)
        }
        console.log("vars.childrenIds", vars.childrenIds);
        console.log("newOrder", newData.map(c => c.id));

        return newData;
      });

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.node.listChildren.invalidate();
    },
  });

  const onReorder = (reordered: Node[]) => {
    updateChildren.mutate({ parentId, childrenIds: reordered.map(c => c.id)})
  }
  const orderedNodes = orderedNodesQuery.data ?? [];
  const { isLoading, isError, error } = orderedNodesQuery;

  if (isError) {
    return <div>Error occured: {JSON.stringify(error)}</div>
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
    <Reorder.Group axis="y" values={orderedNodes} onReorder={onReorder}>
      {
        orderedNodes.length > 0 ? orderedNodes.map(node => (
          <Item key={node.id} node={node} parentId={parentId} />
        )) : (
          <p>You have no lists yet.</p>
        )
      }
    </Reorder.Group >
    <CreateNode parentId={parentId} /></div>
  )
}

type ItemProps = {
  node: Node;
  parentId: string;
}

function Item({ parentId, node }: ItemProps) {
  const controls = useDragControls();
  const utils = api.useUtils();
  const deleteMutation = api.node.delete.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
    },
  });
  const deleteNode = () => {
    console.log("Calling deleteMutation with parentId: ", parentId, "id", node.id);
    deleteMutation.mutate({ parentId, id: node.id });
  }

  return (
    <Reorder.Item value={node} dragListener={false} dragControls={controls}>
      <div
        className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
      >
        <Link href={`/node/${node.id}`}>
          <h3 className="text-2xl font-bold">{node.name}</h3>
          <div className="text-lg">{node.note}</div>
        </Link>
        <button onClick={() => deleteNode()}>Delete</button>
        <div style={{ touchAction: "none" }} onPointerDown={(e) => controls.start(e)}>Drag me</div>
      </div>
    </Reorder.Item>
  )
}
