"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

type CreateNodeProps = {
  parentId: string;
}

export function CreateNode({ parentId }: CreateNodeProps) {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [idx, setIdx] = useState<number | "">();

  const createNode = api.node.create.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
      setName("");
      setNote("");
      setIdx("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createNode.mutate({ name, note, parentId, idx: idx === "" ? undefined : idx });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <input
        type="text"
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <input
        type="number"
        placeholder="Priority"
        value={idx}
        onChange={(e) => setIdx(parseInt(e.target.value))}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createNode.isPending}
      >
        {createNode.isPending ? "Creating..." : "Create Node"}
      </button>
    </form>
  );
}

export function CreateTestData({ parentId }: CreateNodeProps) {
  const utils = api.useUtils();
  const [num, setNum] = useState<number>(20);

  const createTestData = api.node.create.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        for (let i = 0; i < num; i++) {
          await createTestData.mutateAsync({ name: `Item ${i}`, note: "", parentId });
        }
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="number"
        placeholder="Priority"
        value={num}
        onChange={(e) => setNum(parseInt(e.target.value))}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createTestData.isPending}
      >
        {createTestData.isPending ? "Creating..." : "Add test data"}
      </button>
    </form>
  );
}
