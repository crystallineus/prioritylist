"use client";

import { Spinner } from "@nextui-org/react";
import { CreateNode, CreateTestData } from "~/app/_components/create-node";
import { NodeList } from "~/app/_components/node-list";
import { api } from "~/trpc/react";

type Props = {
    id: string;
};

export function NodePage({ id }: Props) {
    const getQuery = api.node.get.useQuery({ id });
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
        <div className="flex flex-col flex-wrap justify-center content-center text-center">
            <h1 className="text-5xl font-extrabold tracking-tight">
                <span>{node.name}</span>
            </h1>
            <div className="w-full md:w-1/2">
                <CreateNode parentId={id} />
                <NodeList parentId={id} />
                <CreateTestData parentId={id} />
            </div>
        </div>
    )
}