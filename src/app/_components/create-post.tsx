"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

export function CreateList() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const createList = api.list.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setName("");
      setNote("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createList.mutate({ name, note });
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
        disabled={createList.isPending}
      >
        {createList.isPending ? "Creating..." : "Create list"}
      </button>
    </form>
  );
}
