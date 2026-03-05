# Storybook Workshop

AI-powered component development workshop. Designers describe what they want — Claude Code builds the components and stories.

## Quick Start

### 1. Install [Antigravity IDE](https://antigravity.google) (free) + Claude Code extension (`Cmd+Shift+X`)

### 2. Open Antigravity terminal (`` Ctrl+` ``) and run:

```bash
# Clone the template into your own GitHub repo
gh repo create my-design-system --template yurkomik/storybook-workshop --clone --public
cd my-design-system

# Install everything (Node, bun, Claude Code, project deps)
chmod +x setup.sh && ./setup.sh

# Open Storybook
bun run storybook
```

### 3. Open Claude Code panel → start building

```
/storybook create StatusBadge
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

In the Claude Code panel inside Antigravity:

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
