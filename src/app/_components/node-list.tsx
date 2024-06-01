"use client";

import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion"
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import { CreateNode, CreateTestData } from "~/app/_components/create-node";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/react";

type Node = RouterOutputs['node']['listChildren'][number];

type NodeListProps = {
  parentId: string;
}

export function NodeList({ parentId }: NodeListProps) {
  const utils = api.useUtils();
  const orderedNodesQuery = api.node.listChildren.useQuery({ parentId });
  const updateChildren = api.node.reorderChildren.useMutation({
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
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.node.listChildren.invalidate();
    },
  });

  const onReorder = (reordered: Node[]) => {
    updateChildren.mutate({ parentId, childrenIds: reordered.map(c => c.id) })
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
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <CreateNode parentId={parentId} />
        <CreateTestData parentId={parentId} />
      </div>
      <Reorder.Group axis="y" values={orderedNodes} onReorder={onReorder}>
        {
          orderedNodes.length > 0 ? orderedNodes.map(node => (
            <Item key={node.id} node={node} parentId={parentId} />
          )) : (
            <p>You have no lists yet.</p>
          )
        }
      </Reorder.Group >
    </div>
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
    deleteMutation.mutate({ parentId, id: node.id });
  }

  return (
    <Reorder.Item value={node} dragListener={false} dragControls={controls} className="mb-4">
      <Card className="max-w-[400px]">
        <CardHeader className="flex gap-3">
          <Link href={`/node/${node.id}`}>
            <h3 className="text-2xl font-bold">{node.name}</h3>
            <div className="text-lg">{node.note}</div>
          </Link>
          <div style={{ touchAction: "none" }} onPointerDown={(e) => controls.start(e)}>Drag me</div>
        </CardHeader>
        <CardBody>
          <Button onPress={() => deleteNode()}>
            Delete
          </Button>
        </CardBody>
      </Card>
    </Reorder.Item>
  )
}
