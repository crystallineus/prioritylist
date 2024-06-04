"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

import { RouterOutputs, api } from "~/trpc/react";

type CreateNodeProps = {
  parentId: string;
}

type Node = RouterOutputs['node']['listChildren'][number];

export function CreateNode({ parentId }: CreateNodeProps) {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [page, setPage] = useState<"info" | "priority">("info");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure({ onClose: () => { resetModal() } });

  const listChildrenQuery = api.node.listChildren.useQuery({ parentId });
  const nodes = listChildrenQuery.data ?? [];
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [count, setCount] = useState(0);

  const resetModal = () => {
    setPage("info");
    setName("");
    setNote("");
    setCount(0);
  }
  const createMutation = api.node.create.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
      setName("");
      setNote("");
    },
  });

  const create = (idx: number) => {
    createMutation.mutate({ name, note, parentId, idx })
    onClose();
  }

  const changePage = () => {
    if (page === "info") {
      setLeft(0);
      setRight(nodes.length);
      setPage("priority");
    } else {
      setPage("info");
    }
  }

  const mid = Math.floor((left + right) / 2);
  const midNode = nodes[mid];

  const handleLower = () => {
    const nextLeft = mid + 1;
    if (count === 3 || nextLeft === right) {
      create(nextLeft);
    } else {
      setLeft(nextLeft);
      setCount(count + 1);
    }
  }

  const handleHigher = () => {
    const nextRight = mid - 1;
    if (count === 3 || nextRight < left) {
      create(left);
    } else {
      setRight(nextRight);
      setCount(count + 1);
    }
  }

  return (
    <>
      <Button isIconOnly onPress={onOpen}><CreateIcon /></Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {page === 'info' && (
            <>
              <ModalHeader className="flex flex-col gap-1">Create Item</ModalHeader>
              <ModalBody>
                <input
                  autoFocus
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
              </ModalBody>
              <ModalFooter>
                <Button color="default" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={changePage}>
                  Next
                </Button>
              </ModalFooter>
            </>
          )}
          {page === 'priority' && (
            <>
              <ModalHeader className="flex flex-col gap-1">Priority Item</ModalHeader>
              <ModalBody>
                {midNode?.name ?? "The node is going to be the first priority."}
              </ModalBody>
              <ModalFooter>
                <Button onPress={handleLower}>
                  Lower
                </Button>
                <Button onPress={handleHigher}>
                  Higher
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
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