# CLAUDE.md

Storybook workshop template. React 19, Vite, Tailwind CSS v4, Storybook 10, Chromatic.

## First-Time Setup

If node_modules/ doesn't exist or the user says they just cloned/started:

1. Run `chmod +x setup.sh && ./setup.sh --no-open` — installs all dependencies
2. Run `bun run storybook` — opens Storybook at http://localhost:6006
3. Point them to `docs/storybook-workshop-guide.md` for the full workshop curriculum

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
