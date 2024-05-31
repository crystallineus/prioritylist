import Link from "next/link";

import { CreateList } from "~/app/_components/create-post";
import { api } from "~/trpc/server";

export default async function Home() {
  const hello = await api.list.hello();
  const lists = await api.list.list();

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
        {lists.length > 0 ? lists.map(list => (
          <Link
            key={list.id}
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="https://create.t3.gg/en/usage/first-steps"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">{list.name}</h3>
            <div className="text-lg">{list.note}
            </div>
          </Link>
        )) : (
          <p>You have no lists yet.</p>
        )}
        <CreateList />
      </div>
    </main>
  );
}
