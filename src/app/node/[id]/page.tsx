import { NodeList } from "~/app/_components/node-list";
import { SignedIn } from "@clerk/nextjs";
import { api } from "~/trpc/server";
import { CreateNode, CreateTestData } from "~/app/_components/create-node";

export default async function Page({ params }: { params: { id: string } }) {
  const node = (await api.node.get({ id: params.id }))[0];
  if (node === undefined) {
    throw new Error(`Failed to get node with ID: ${params.id}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <SignedIn>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">{node.name}</span>
        </h1>
        <div className="w-full md:w-1/2">
          <CreateNode parentId={params.id} />
          <NodeList parentId={params.id} />
          <CreateTestData parentId={params.id} />
        </div>
      </SignedIn>
    </main>
  );
}
