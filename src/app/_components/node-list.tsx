"use client";

import Link from "next/link";
import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion"
import { type RouterOutputs } from "~/trpc/react";

type Node = RouterOutputs['node']['listNodes'][number];

type NodeListProps = {
  nodes: Node[],
}

export function NodeList({ nodes }: NodeListProps) {
  const [orderedNodes, setOrderedNodes] = useState(nodes);

  const onReorder = (reordered: Node[]) => {
    setOrderedNodes(reordered);
  }

  return (
    <Reorder.Group axis="y" values={orderedNodes} onReorder={onReorder}>
      {
        orderedNodes.length > 0 ? orderedNodes.map(node => (
          <Item key={node.id} node={node} />
        )) : (
          <p>You have no lists yet.</p>
        )
      }
    </Reorder.Group >)
}

type ItemProps = {
  node: Node,
}

function Item({ node }: ItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item value={node} dragListener={false} dragControls={controls}>
      <div
        className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
      >
        <Link href="https://google.com">
          <h3 className="text-2xl font-bold">{node.name}</h3>
          <div className="text-lg">{node.note}</div>
        </Link>
        <div style={{ touchAction: "none" }} onPointerDown={(e) => controls.start(e)}>Drag me</div>
      </div>
    </Reorder.Item>
  )
}
