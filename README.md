# PriorityList

## Tech stack

- [T3 Stack](https://create.t3.gg/)
- [Next.js](https://nextjs.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Clerk](https://clerk.com/)
- [Vercel](https://vercel.com/)
- [Github actions](https://docs.github.com/en/actions)

## Learning resources

- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)

## Running the project locally 

Install [Docker](https://docs.docker.com/get-docker/).

Setup [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers).

Create a local `.env` file. See `src/env.js` for which env vars are required.

Run:
```
npm install
npm run db:migrate
npm run dev
```

## Deployment

Clerk
- Create an application
- Grab the keys for the environment variables: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

Vercel
- Create a postgres database instance
    - Grab the keys for the environment variable: `DATABASE_URL`
- Create a new project and import the github repo. Configure the relevant environment vars.

Github actions
- Add a github secret for the github actions workflows named `DATABASE_URL`. This should point to the vercel postgres database.
