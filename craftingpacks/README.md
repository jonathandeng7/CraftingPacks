# CraftingPacks

Next.js (App Router) + TypeScript + Tailwind app that generates a Minecraft datapack ZIP from an idea, using Gemini.

## Setup

1) Install dependencies:

```bash
npm install
```

2) Create `.env.local`:

```bash
GEMINI_API_KEY=your_api_key_here
```

3) Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Usage

- Enter an idea, pick a Minecraft version (defaults to `1.20.1`), click **Generate**.
- The server calls Gemini, validates the generated datapack files, zips them, and returns an `application/zip` download.
- The UI previews the returned file paths and enables **Download**.

## Key Files

- UI: `src/app/page.tsx`
- API route: `src/app/api/generate/route.ts`
- Helpers:
	- `lib/datapackPrompt.ts`
	- `lib/gemini.ts`
	- `lib/validateDatapack.ts`
	- `lib/zipDatapack.ts`

## Notes / Troubleshooting

- If you see a Next.js warning about “multiple lockfiles” and an unexpected workspace root, it means there’s another `package-lock.json` higher up on your machine. Removing the extra lockfile (or configuring `turbopack.root`) will silence it.
