import { NodeList } from "~/app/_components/node-list";
import { SignedIn } from "@clerk/nextjs";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
    const node = (await api.node.get({ id: params.id}))[0];
    if (node === undefined) {
      throw new Error(`Failed to get node with ID: ${params.id}`);
    }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <SignedIn>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">{node.name}</span>
        </h1>
          <NodeList parentId={params.id} />
        </SignedIn>
    </main>
  );
}
