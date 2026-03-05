# CLAUDE.md

Storybook workshop template. React 19, Vite, Tailwind CSS v4, Storybook 10, Chromatic.

## First-Time Setup

If node_modules/ doesn't exist or the user says they just cloned/started:

1. Run `chmod +x setup.sh && ./setup.sh --no-open` — installs all dependencies
2. Run `bun run storybook` — starts the dev server
3. Tell the user to open **http://localhost:6006** in their browser — they'll see Button and FileUpload components with interactive stories
4. Point them to `docs/storybook-workshop-guide.md` for the full workshop curriculum
5. To create new components, they can type `/storybook create ComponentName` in this chat

## Publishing (when user wants to push/save/deploy)

The local clone initially points to the template repo (read-only). Create their own remote:

```bash
git remote remove origin
gh auth login                                           # one-time, opens browser
gh repo create my-design-system --source=. --push --public
```

## Available Skill

This project has a `/storybook` skill for component development:

```
/storybook create StatusBadge          # New component + stories
/storybook stories Button              # Regenerate stories for existing component
/storybook review FileUpload           # Audit story coverage
/storybook chromatic run               # Run visual regression tests
```

Skill definition: `.claude/skills/storybook/SKILL.md`

## Project Structure

- `src/components/ui/` — Simple reusable components (Button, Progress)
- `src/components/showcase/` — Complex multi-file components (FileUpload)
- `.storybook/` — Storybook configuration with dark mode + a11y
- `docs/` — Workshop curriculum and facilitator notes

## Commands

- `bun run storybook` — Start dev server (port 6006)
- `bun run build-storybook` — Production build
- `bun run chromatic` — Visual regression tests (needs CHROMATIC_PROJECT_TOKEN in .env.local)

## Conventions

- Use `satisfies Meta<typeof Component>` — never `as Meta`
- Always include `tags: ['autodocs']` in story meta
- Story file: `ComponentName.stories.tsx` next to component
- Styling: Tailwind v4 + CVA variants + `cn()` from `@/lib/utils`
- Icons: lucide-react
- Primitives: Radix UI
