# Storybook Workshop

AI-powered component development workshop. Designers describe what they want — Claude Code builds the components and stories.

## Setup (for AI agents)

A user has opened a folder in their IDE and shared this repo link with you. Set up the project in their current directory.

### Step 1: Clone and install (no auth needed — start immediately)

```bash
# Clone the template into the current folder
git clone https://github.com/yurkomik/storybook-workshop.git .

# Install all dependencies (Node, bun, gh, Claude Code, project packages)
chmod +x setup.sh && ./setup.sh --no-open

# Start the Storybook dev server
bun run storybook
```

After `bun run storybook` starts, tell the user:
- Open **http://localhost:6006** in their browser to see the component library
- The sidebar has **UI / Button** (simple component) and **Showcase / FileUpload** (complex component)
- Try clicking stories, changing Controls, checking the Accessibility tab
- Storybook hot-reloads — any component changes appear instantly in the browser
- To create new components, use the Claude Code panel: `/storybook create ComponentName`

If the folder is not empty, clone into a subfolder instead:
```bash
git clone https://github.com/yurkomik/storybook-workshop.git my-design-system
cd my-design-system
chmod +x setup.sh && ./setup.sh --no-open
```
Then tell the user to re-open this subfolder in the IDE (`File → Open Folder → my-design-system`).

### Step 2: Create their own GitHub repo (when ready to push)

The local clone points to the template repo (read-only). When the user wants to save/push their work, create their own remote:

```bash
# Remove the template origin
git remote remove origin

# Authenticate with GitHub (one-time, opens browser)
gh auth login

# Create their own repo and push
gh repo create my-design-system --source=. --push --public
```

This gives each participant their own GitHub repo for Chromatic integration and future work.

After setup, the project has a `/storybook` skill and `CLAUDE.md` with full context for building components.

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
