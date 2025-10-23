# NineTwo Performance - Website Institucional

Este é o website institucional da NineTwo Performance (ninetwo.com.br).
Não está relacionado com a aplicação CRM principal, que está em ninetwo-front e ninetwo-server.

## Getting Started

We're using Next.js
We're using Postgres for the database. Mandatory for the website to work, even locally.

1. Copy the .env.example file to .env and fill in the values.

2. Run the migrations:

```bash
npx nx run ninetwo-website:database:migrate
```

3. From the root directory:

```bash
npx nx run ninetwo-website:dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Or to build in prod:

```bash
npx nx run ninetwo-website:build
npx nx run ninetwo-website:start
```
