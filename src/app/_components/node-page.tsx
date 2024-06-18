"use client";

import { Link, Spinner, Switch } from "@nextui-org/react";
import { useState } from "react";
import { CreateNode, CreateTestData } from "~/app/_components/create-node";
import { NodeList } from "~/app/_components/node-list";
import { api } from "~/trpc/react";
import { Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";

type Props = {
    id: string;
};

export function NodePage({ id }: Props) {
    const getQuery = api.node.get.useQuery({ id });
    const [showCompleted, setShowCompleted] = useState(false);
    const node = getQuery?.data?.[0];
    if (getQuery.isError) {
        return <div>Error</div>
    }
    if (getQuery.isLoading) {
        return <Spinner />
    }
    if (!node) {
        throw new Error(`Node query returned no data, id: ${id}`);
    }

    return (
        <div className="flex flex-col flex-wrap justify-center content-center text-center mx-4 mt-8">
            <div className="flex flex-row w-full max-w-[1024px]">
                <div className="flex flex-col text-left mb-4">
                    {!!node.url && (
                        <Link href={node.url} target="_blank" className="flex-grow basis-0">
                            {!!node.urlPreviewImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    style={{ maxHeight: 156 }}
                                    alt={`Image of ${node.name}`}
                                    src={node.urlPreviewImageUrl}
                                />
                            ) : (
                                <p>Open link</p>
                            )}
                        </Link>
                    )}
                </div>
                <div className="flex flex-col text-left mb-4 ml-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span>{node.name}</span>
                    </h1>
                    <p className="text-gray-500">{node.urlPreviewDescription ?? ""}</p>
                    <p className="text-black-500">{node.note ?? ""}</p>
                </div>
            </div>
            <div className="flex flex-row ml-auto gap-3">
                <p>
                    {node.childrenIds.length > 0 && <p>{node.childrenIds.length} item(s)</p>}
                </p>
                <div className="flex text-left gap-3 mb-4">
                    <CreateNode parentId={id} />
                    <Popover showArrow={true}>
                        <PopoverTrigger>
                            <Button isIconOnly><EllipsisIcon /></Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            {!!node.completedNodeId && node.nodeType === "default" && (
                                <Switch
                                    isSelected={showCompleted}
                                    onValueChange={setShowCompleted}
                                    className="mr-3 mt-3 mb-4"
                                >
                                    <p>Completed</p>
                                </Switch>
                            )}
                            <CreateTestData parentId={id} />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="w-full max-w-[1024px]">
                {showCompleted && node.completedNodeId ? <NodeList parentId={node.completedNodeId} /> : <NodeList parentId={id} />}
            </div>
        </div>
    )
}

function EllipsisIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>

}