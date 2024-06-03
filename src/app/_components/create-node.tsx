"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from "@nextui-org/react";

import { api } from "~/trpc/react";

type CreateNodeProps = {
  parentId: string;
}

export function CreateNode({ parentId }: CreateNodeProps) {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [page, setPage] = useState<"info" | "priority">("info");
  const [idx, setIdx] = useState<number | "">();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const createMutation = api.node.create.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
      setName("");
      setNote("");
      setIdx("");
    },
  });

  const create = () => {
    createMutation.mutate({ name, note, parentId, idx: idx === "" ? undefined : idx })
    onClose();
  }

  return (
    <>
      <Button isIconOnly onPress={onOpen}><CreateIcon /></Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        {page === 'info' && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
                <ModalBody>
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
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" disabled={createMutation.isPending}
                    onPress={create}>
                    {createMutation.isPending ? "Creating..." : "Create Node"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}
        {page === 'priority' && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
                <ModalBody>
                  TODO
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" disabled={createMutation.isPending}
                    onPress={create}>
                    {createMutation.isPending ? "Creating..." : "Create Node"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}
      </Modal>
    </>
  );
}

export function CreateTestData({ parentId }: CreateNodeProps) {
  const utils = api.useUtils();
  const [num, setNum] = useState<number>(10);

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

function CreateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}