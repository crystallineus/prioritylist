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

  const createNode = api.node.create.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
      setName("");
      setNote("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createNode.mutate({ name, note, parentId });
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
