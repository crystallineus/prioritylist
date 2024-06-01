import { CreateNode } from "~/app/_components/create-node";
import { api } from "~/trpc/server";
import { NodeList } from "~/app/_components/node-list";
import { SignedIn } from "@clerk/nextjs";

export default async function Home() {
  const hello = await api.node.hello();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">Priority</span>List
        </h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">
            {hello ? hello.greeting : "Loading..."}
          </p>
        </div>
        <SignedIn>
          <RootNode />
        </SignedIn>
      </div>
    </main>
  );
}

async function RootNode() {
  let root = (await api.node.getRootNode())[0];
  if (root === undefined) {
    await api.node.createRootNode();
    root = (await api.node.getRootNode())[0];
  }
  if (root === undefined) {
    throw new Error(`Failed to create root node for user`);
  }

  return (
    <>
      <NodeList parentId={root.node.id} />
    </>
  )
}
