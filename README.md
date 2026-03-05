# Storybook Workshop

AI-powered component development workshop. Designers describe what they want — Claude Code builds the components and stories.

## Setup (for AI agents)

A user has opened a folder in their IDE and shared this repo link with you. Set up the project in their current directory:

```bash
# 1. Clone into the current folder
git clone https://github.com/yurkomik/storybook-workshop.git .

# 2. Install all dependencies (Node, bun, project packages)
chmod +x setup.sh && ./setup.sh --no-open

# 3. Start Storybook
bun run storybook
```

After setup, the project has a `/storybook` skill and `CLAUDE.md` with full context for building components.

**If the folder is not empty**, clone into a subfolder instead:
```bash
git clone https://github.com/yurkomik/storybook-workshop.git my-design-system
cd my-design-system
chmod +x setup.sh && ./setup.sh --no-open
```
Then tell the user to re-open this subfolder in the IDE (`File → Open Folder → my-design-system`).

## Quick Start (for designers)

1. Install [Antigravity IDE](https://antigravity.google) (free) + Claude Code extension (`Cmd+Shift+X`)
2. Create a new folder for your project (`File → Open Folder → New Folder`)
3. Open the Claude Code panel in the sidebar
4. Paste this repo link and say: *"Set up this project for me"*
5. The AI clones the repo, installs everything, and launches Storybook

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

In the Claude Code panel:

```
/storybook create StatusBadge              # New component + stories
/storybook create Dashboard --type=showcase # Complex multi-file component
/storybook stories Button                  # Regenerate stories for existing component
/storybook review FileUpload              # Audit story coverage
/storybook chromatic run                  # Run visual regression tests
```

## Visual Testing with Chromatic

```bash
cp .env.example .env.local
# Edit .env.local → add CHROMATIC_PROJECT_TOKEN
bun run chromatic
```

## Workshop Guide

See [docs/storybook-workshop-guide.md](docs/storybook-workshop-guide.md) for the full 2.5-hour curriculum.

## Stack

React 19 + Vite + Tailwind CSS v4 + Storybook 10 + Chromatic
