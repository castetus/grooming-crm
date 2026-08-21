<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Custom rules

## General
### 1. Do exactly what I've asked for
### 2. Don't write any code if it's not nesessary
### 3. Don't remove any comments, console.logs etc. was written by me
### 4. Try to keep code clean, avoid unnesessary checks

## TypeScript
### 1. Don't use any
### 2. Avoid assertions

## Codestyle and linting
### In TS use only `''`, in TSX use `""`
### Ever use `;` where it is needed

## Styles
### 1. Two main screen widths: 1920 (laptop) and 390 (mobile)
### 2. Adapt all the layouts for these 2 dimentions first
### 3. Avoid custom styles, use shadcn and tailwind whenever it's possible