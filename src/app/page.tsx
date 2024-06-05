import { api } from "~/trpc/server";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { NodePage } from "~/app/_components/node-page";

export default async function Home() {
  return (
    <main>
      <SignedIn>
        <RootNode />
      </SignedIn>
      <SignedOut>
        Please log in
      </SignedOut>
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
    <NodePage id={root.node.id} />
  )
}
