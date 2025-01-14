# Architecture
This document describes the high-level architecture of Cella.

 1. Only build what you are going to use yourself.
 2. Stay humble and remain a template, not a framework. So prevent abstraction layers.
 3. A single, opinionated stack: ie. Cella uses Drizzle ORM and will not make it replaceable with another ORM.
 4. Modularity. As CellaJS will grow, we need to make sure you can scaffold only the modules that you need.
 5. Open standards. Our long term vision is that each Cella - as in each cell - can speak fluently with other cells. 

### Backend
- [Hono](https://hono.dev) + [NodeJS](https://nodejs.org)
- [Postgres](https://www.postgresql.org) / [PGLite](https://pglite.dev/) + [Drizzle ORM](https://orm.drizzle.team/)
- [Zod](https://github.com/colinhacks/zod)
- [OpenAPI](https://www.openapis.org)
- [Lucia Auth](https://lucia-auth.com/)
- [JSX Email](https://jsx.email/)

### Frontend
- [React](https://reactjs.org)
- [Tanstack Router](https://github.com/tanstack/router)
- [Tanstack Query](https://github.com/tanstack/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [Electric Sync](https://electric-sql.com/)

### Frontend / UI
- [React Data Grid](https://github.com/adazzle/react-data-grid)
- [Shadcn UI](https://ui.shadcn.com)
- [I18next](https://www.i18next.com)
- [Lucide icons](https://lucide.dev)

### Build tools
- [Vite](https://vitejs.dev) + [Vite-PWA](https://github.com/antfu/vite-plugin-pwa)
- [Turborepo](https://turborepo.dev) + [pnpm](https://pnpm.io)
- [Biome](https://biomejs.dev)
- [Lefthook](https://github.com/evilmartians/lefthook)

## File structure
```
.
├── backend
|   ├── .db                   Location of db when using pglite
|   ├── emails                Email templates with jsx-email
│   ├── drizzle               DB migrations
│   ├── seed                  Seed scripts
│   ├── src                   
│   │   ├── db                Connect, table schemas
│   │   ├── lib               Init library code & important helpers
│   │   ├── middlewares       Hono middlewares
│   │   ├── modules           Modular distribution of routes, schemas etc
│   │   └── types             Split between common and app-specific
│   │   └── utils             
├── config                    Shared config: default, development, production
├── frontend                  Frontend SPA
│   ├── public                
│   ├── src                   
│   │   ├── api               API functions with RPC
│   │   ├── hooks             
│   │   ├── json              
│   │   ├── lib               Library code and helper functions
│   │   ├── modules           Modular distribution of components
│   │   ├── routes            Code-based routes
│   │   ├── store             Zustand data stores
│   │   ├── types             Split between common and app-specific
│   │   ├── utils             
├── info                      General info
├── locales                   Translations
└── tus                       TUS server
```

## Data modeling
Entities can be split in four types:
* All entities (user, organization)
* PageEntity: Entity that can be searched for (user, organization)
* ContextEntity: Has memberships (organization)
* ProductEntity: Content related entities without membership

The default cella setup has one example product entity - `attachments` - and one context: `organizations`. 

## API Design
An OpenAPI is built with [zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi). Please read the readme in this middleware before you get started.

## Modularity
Both frontend and backend already have modules, such as `authentication`, `users` and `organizations`. The backend modules are split mostly by functionality. The frontend modules are split by the user interface: `home`, `organizations`, `marketing`. The benefit of modularity is twofold: better code (readability, portability etc) and to make receiving cella updates possible.

Zooming in on some of the frontend modules:
* `common`: a cella-predefined set of reusable react components 
* `ui`: Full with shadcn UI components. They have some small tweaks however and it is to be expected you will customize them yourself further.
* `attachments`: product entity module that has support for offline, optimistic updates and realtime sync.

A similar situation can be found in the `types` folders of both frontend and backend. you have app-specific types in `app.ts` and predefined cella types in `common.ts`.

In the frontend we decided - for now - to keep `routes`, `stores`, `hooks` and `api` together and not nest them in each respective module. This has pros and cons but the idea here is that having them together gives you a quick look into what the complete app has to offer, and to make it easier to strive for consistency. This benefit wil reduce when cella gets more stable, so its likely this will change in the future.


## Security

Link to valuable resources:
* https://mvsp.dev/mvsp.en/
 