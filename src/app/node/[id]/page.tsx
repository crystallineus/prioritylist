import { SignedIn, SignedOut } from "@clerk/nextjs";
import { NodePage } from "~/app/_components/node-page";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <main>
      <SignedIn>
        <NodePage id={params.id} />
      </SignedIn>
      <SignedOut>
        You are not logged in
      </SignedOut>
    </main>
  );
}
