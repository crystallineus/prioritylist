import { Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import { api, RouterOutputs } from "~/trpc/react";
type Node = RouterOutputs['node']['listChildren']["children"][number];

type EditNodeProps = {
  node: Node;
}

export function UpdateNode({ node }: EditNodeProps) {
  const utils = api.useUtils();
  const [name, setName] = useState(node.name);
  const [note, setNote] = useState(node.note ?? "");
  const [urlPreviewDescription, setUrlPreviewDescription] = useState(node.urlPreviewDescription ?? "");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const updateMutation = api.node.update.useMutation({
    async onSuccess() {
      await utils.node.get.invalidate({ id: node.id });
    },
  });

  const update = () => {
    if (node.url) {
      updateMutation.mutate({
        name, url: node.url, urlPreviewDescription, urlPreviewImageUrl: node.urlPreviewImageUrl ?? "", note, id: node.id
      });
    } else {
      updateMutation.mutate({
        name, note, id: node.id
      });
    }
    onClose();
  }

  return (
    <>
      <Button isIconOnly onPress={onOpen}><PencilIcon /></Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Edit Item</ModalHeader>
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
            {!!node.url && (
              <>
                {!!urlPreviewDescription &&
                  <input
                    type="text"
                    placeholder="urlPreviewDescription"
                    value={urlPreviewDescription}
                    onChange={(e) => setUrlPreviewDescription(e.target.value)}
                    className="w-full rounded-full px-4 py-2 text-black"
                  />
                }
                {!!node.urlPreviewImageUrl &&
                  <Link href={node.url} target="_blank" className="flex-grow basis-0">
                    {!!node.urlPreviewImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="w-full px-4 py-2 text-black"
                        alt={`Image of ${name}`}
                        src={node.urlPreviewImageUrl}
                      />
                    ) : (
                      <p>Open link</p>
                    )}
                  </Link>}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" onPress={() => update()}>
              Edit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

function PencilIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </svg>
}