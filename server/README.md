To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000

## Database & Prisma

This project uses Prisma with PostgreSQL.

**Apply migrations (Development):**
Reflects schema changes in the database.
```sh
bunx prisma migrate dev
```

**Open Prisma Studio (GUI):**
View and edit data in the browser.
```sh
bunx prisma studio
```

**Generate Prisma Client:**
Run this after changing `schema.prisma` if types are not updating.
```sh
bunx prisma generate
```

**Reset Database:**
Drops and recreates the database (⚠️ deletes all data).
```sh
bunx prisma migrate reset
```