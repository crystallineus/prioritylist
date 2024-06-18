"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Spinner, Input } from "@nextui-org/react";
import { api } from "~/trpc/react";

type CreateNodeProps = {
  parentId: string;
}

export function CreateNode({ parentId }: CreateNodeProps) {
  const utils = api.useUtils();
  const [nameOrUrl, setNameOrUrl] = useState("");
  const [note, setNote] = useState("");
  const [page, setPage] = useState<"info" | "priority">("info");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure({ onClose: () => { resetModal() } });
  const url = useMemo(() => {
    try {
      const url = new URL(nameOrUrl);
      return url.href;
    } catch (_) {
      return "";
    }
  }, [nameOrUrl])
  const getLinkPreviewQuery = api.node.getLinkPreview.useQuery({ url }, { enabled: url !== "" });

  useEffect(() => {
    if (getLinkPreviewQuery.data) {
      setTitle(getLinkPreviewQuery.data.title || "");
      setDescription(getLinkPreviewQuery.data.description ?? "");
    }
  }, [getLinkPreviewQuery.data]);

  const listChildrenQuery = api.node.listChildren.useQuery({ parentId, limit: 1000 });
  const nodes = listChildrenQuery.data?.children ?? [];
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [count, setCount] = useState(0);

  const resetModal = () => {
    setPage("info");
    setNameOrUrl("");
    setNote("");
    setCount(0);
    setTitle("");
    setDescription("");
  }
  const createMutation = api.node.create.useMutation({
    async onSuccess() {
      await utils.node.listChildren.invalidate({ parentId });
      setNameOrUrl("");
      setNote("");
    },
  });

  const create = (idx: number) => {
    if (!!getLinkPreviewQuery.data) {
      const data = getLinkPreviewQuery.data;
      createMutation.mutate({ name: title, url: nameOrUrl, urlPreviewDescription: description, urlPreviewImageUrl: data.imageUrl, note, parentId, idx })
    } else {
      createMutation.mutate({ name: nameOrUrl, note, parentId, idx })
    }
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
                  placeholder="Name or URL"
                  value={nameOrUrl}
                  onChange={(e) => setNameOrUrl(e.target.value)}
                  className="w-full rounded-full px-4 py-2 text-black"
                />
                <input
                  type="text"
                  placeholder="Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-full px-4 py-2 text-black"
                />
                {getLinkPreviewQuery.isLoading && <Spinner />}
                {!!getLinkPreviewQuery.data && (
                  <>
                    <h2>
                      <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-full px-4 py-2 text-black"
                      />
                    </h2>
                    {!!getLinkPreviewQuery.data.description &&
                      <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-full px-4 py-2 text-black"
                      />
                    }
                    {!!getLinkPreviewQuery.data.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="max-w-48"
                        alt={`Image of ${getLinkPreviewQuery.data.title}`}
                        src={getLinkPreviewQuery.data.imageUrl}
                      />
                    )}
                  </>
                )}
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
              {
                nodes.length > 0 && (
                  <ModalFooter>
                    <Button onPress={handleLower}>
                      Lower
                    </Button>
                    <Button onPress={handleHigher}>
                      Higher
                    </Button>
                  </ModalFooter>
                ) || <ModalFooter>
                  <Button onPress={onClose}>
                    Close
                  </Button>
                  <Button onPress={() => { create(0); }}>
                    Create
                  </Button>
                </ModalFooter>
              }
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
      await utils.node.get.invalidate({ id: parentId });
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
      <Input
        type="number"
        placeholder="Priority"
        value={num.toString()}
        onChange={(e) => setNum(parseInt(e.target.value))}
      />
      <Button
        type="submit"
        disabled={createTestData.isPending}
        className="mb-3"
      >
        {createTestData.isPending ? "Creating..." : "Add test data"}
      </Button>
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