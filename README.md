# Storybook Workshop

AI-powered component development workshop. Designers describe what they want — Claude Code builds the components and stories.

## Quick Start

```bash
# 1. Clone this template
git clone <your-repo-url> my-design-system
cd my-design-system

# 2. Run setup (installs Node, bun, Claude Code if missing)
chmod +x setup.sh && ./setup.sh

# 3. Open Storybook
bun run storybook
```

Open [http://localhost:6006](http://localhost:6006) to browse components.

## What's Inside

| Path | Description |
|------|-------------|
| `src/components/ui/` | Simple components (Button, Progress) |
| `src/components/showcase/` | Complex components (FileUpload) |
| `.storybook/` | Storybook config (dark mode, a11y, Chromatic) |
| `.claude/skills/storybook/` | AI skill — `/storybook create MyComponent` |
| `setup.sh` | Zero-to-working dependency installer |
| `docs/` | Workshop curriculum + facilitator notes |

## Using the AI Skill

In Claude Code (terminal or IDE extension):

```
/storybook create StatusBadge              # New component + stories
/storybook create Dashboard --type=showcase # Complex multi-file component
/storybook stories Button                  # Regenerate stories for existing component
/storybook review FileUpload              # Audit story coverage
/storybook chromatic run                  # Run visual regression tests
```

## Visual Testing with Chromatic

```bash
# Set your token
cp .env.example .env.local
# Edit .env.local → add CHROMATIC_PROJECT_TOKEN

# Run visual tests
bun run chromatic
```

## Workshop Guide

See [docs/storybook-workshop-guide.md](docs/storybook-workshop-guide.md) for the full 2.5-hour curriculum.

## Stack

React 19 + Vite + Tailwind CSS v4 + Storybook 10 + Chromatic
