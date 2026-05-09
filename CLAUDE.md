# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server with HMR
pnpm build      # production build to dist/
pnpm preview    # preview production build
pnpm lint       # run ESLint
```

No test runner is configured yet.

## Stack

- **React 19** + **Vite 8** — single-page app, entry at `src/main.jsx`
- **Tailwind CSS v4** — loaded via the `@tailwindcss/vite` plugin (no `tailwind.config.js`). Utility classes work out of the box; custom design tokens go in the `@theme {}` block in `src/index.css`
- **Package manager: pnpm**

## Styling conventions

`src/index.css` is the single CSS entry point. It imports Tailwind and defines the theme:

- `--font-sans`: Inter
- `--font-mono`: JetBrains Mono

Add new design tokens (colors, spacing, etc.) to the `@theme {}` block there rather than in component-level CSS. `src/App.css` exists but is empty — prefer Tailwind utilities over additional CSS files.
