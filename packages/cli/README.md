# @insyte/cli

Command-line tools for Insyte — **the same workflow as Prisma Studio**.

## Install

```bash
bun add -d @insyte/cli @insyte/track
```

## Commands

### `insyte studio`

Open the local analytics browser (like `prisma studio`):

```bash
npx insyte studio
```

Options:

| Flag | Description |
|------|-------------|
| `-p, --port` | Port (default: 5555) |
| `-d, --database` | SQLite path (default: `.insyte/analytics.db`) |
| `--no-open` | Don't open the browser |

### `insyte init`

Scaffold Insyte in your project:

```bash
npx insyte init
npx insyte init --framework next
```

Generates SDK wiring files and `.env.example`.

## Typical workflow

```bash
# 1. Install
bun add @insyte/track
bun add -d @insyte/cli

# 2. Scaffold (optional)
npx insyte init --framework next

# 3. Run your app
bun run dev

# 4. Browse analytics
npx insyte studio
```

Database path: `.insyte/analytics.db` in your project root.
