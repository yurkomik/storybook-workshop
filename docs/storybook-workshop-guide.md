# Storybook Workshop — Participant Guide

> Build production UI components using AI. No coding experience required.

**Duration:** 2.5 hours (with breaks)
**Audience:** Designers, PMs, non-coders
**What you'll learn:** How to create, preview, iterate, and deploy UI components using Storybook + Claude Code

---

## Pre-Workshop Checklist

Complete these **before** the workshop:

- [ ] **GitHub account** — [github.com/signup](https://github.com/signup) (free)
- [ ] **Chromatic account** — [chromatic.com/start](https://www.chromatic.com/start) (sign in with GitHub, free tier)
- [ ] **Anthropic account** — [console.anthropic.com](https://console.anthropic.com) (for Claude Code authentication)
- [ ] **macOS laptop** with admin access (Windows users: install WSL first)
- [ ] **IDE installed** — [Antigravity](https://antigravity.google) (recommended, free) or VS Code / Cursor

---

## Phase 1: Setup (30 min)

### 1.1 Get the Template

Open Terminal (`Cmd + Space` → type "Terminal"). Your facilitator will share the commands.

**If you already have `gh` CLI and GitHub auth:**
```bash
gh repo create my-design-system --template yurkomik/storybook-workshop --clone --public
cd my-design-system
```

**If starting from scratch:**
```bash
# Install GitHub CLI first (macOS)
brew install gh || echo "Install from https://cli.github.com"

# Authenticate with GitHub
gh auth login

# Create your repo from the template
gh repo create my-design-system --template yurkomik/storybook-workshop --clone --public
cd my-design-system
```

> **Alternative:** Go to the template repo on GitHub, click **"Use this template"** → **"Create a new repository"**, then clone it manually.

### 1.2 Run the Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

This script automatically installs everything you need:
- **GitHub CLI** (for pushing code later)
- **fnm** (Node.js version manager)
- **Node.js 22** (JavaScript runtime)
- **bun** (fast package manager)
- **Claude Code** (AI coding assistant)
- Project dependencies

> **Tip:** If you already have these tools, the script skips them. Safe to run multiple times.

### 1.3 Authenticate Claude Code

```bash
claude
```

Follow the prompts to log in with your Anthropic account. Type `/exit` to return to the terminal.

### 1.4 Install Claude Code in Your IDE

1. Open Antigravity (or VS Code / Cursor)
2. Press `Cmd + Shift + X` (Extensions panel)
3. Search "Claude Code" → Install
4. Open the Claude Code panel in the sidebar

### 1.5 Verify Everything Works

```bash
bun run storybook
```

Open [http://localhost:6006](http://localhost:6006) — you should see the Storybook UI with a Button component.

**Checkpoint:** Everyone should see Storybook running with the Button component visible.

---

## Phase 2: Explore Storybook (15 min)

### 2.1 Navigate the Sidebar

The left sidebar shows your component library:
- **UI / Button** — A simple, reusable button component
- **Showcase / FileUpload** — A complex, multi-part file upload component

Click on **UI / Button** → **Default** to see the simplest button.

### 2.2 Discover the Panels

At the bottom of the screen, explore these tabs:

| Tab | What it does |
|-----|-------------|
| **Controls** | Change props live — try different variants, sizes, toggle disabled |
| **Docs** | Auto-generated documentation with code examples |
| **Accessibility** | WCAG compliance audit — catches color contrast, missing labels |

### 2.3 Try Interactive Stories

Click **UI / Button → Interactive**. This story has:
- A live component you can interact with
- A **debug panel** showing the current state (e.g., click count)
- Working **Controls** to change the component while interacting

### 2.4 Explore FileUpload

Navigate to **Showcase / FileUpload**. Browse through its stories:
- **Default** — Basic upload zone
- **Uploading** — Files mid-upload with progress bars
- **Error** — What happens when uploads fail
- **DragOver** — The drag-and-drop highlight effect
- **Responsive** — How it looks on mobile vs desktop

> **Key insight:** Each story captures ONE specific state. This makes visual testing possible — Chromatic snapshots every state automatically.

**Checkpoint:** Everyone understands Controls, Docs, and A11y panels.

---

## Phase 3: Create a Component with AI (45 min)

This is the core of the workshop. You'll describe a component in plain English, and Claude Code will build it.

### 3.1 Open Claude Code

In your IDE, open the Claude Code panel. Or use the terminal:

```bash
claude
```

### 3.2 Describe Your Component

Try one of these prompts (or invent your own):

**Option A — Status Badge:**
```
/storybook create StatusBadge

A small badge that shows status. Variants:
- success (green, checkmark icon)
- warning (yellow, alert icon)
- error (red, X icon)
- info (blue, info icon)
- neutral (gray, no icon)

Sizes: sm, md, lg
Can have a dot indicator (pulsing for active statuses)
Can be dismissible (X button appears on hover)
```

**Option B — Avatar Group:**
```
/storybook create AvatarGroup

Shows a row of overlapping circular avatars with:
- Configurable max visible (rest show as "+N" badge)
- Size variants: sm (24px), md (32px), lg (48px)
- Online status dot (green/gray/yellow)
- Click to expand into a full list
- Fallback: initials when no image provided
```

**Option C — Your Own Idea:**
```
/storybook create [YourComponentName]

[Describe what it looks like and how it behaves]
```

### 3.3 Watch the AI Work

Claude Code will:
1. Create the component file(s)
2. Create a comprehensive story file with 10+ stories
3. Run a build to verify everything compiles

**Don't interrupt** — let it complete the full cycle (usually 1-2 minutes).

### 3.4 Review in Storybook

Your Storybook should hot-reload automatically. If not, refresh the browser.

Browse through all the stories Claude created. Check:
- Does the **Default** story look right?
- Do the **variants** match what you described?
- Does the **Interactive** story work as expected?
- Is the **DarkMode** story consistent?
- Are there **accessibility** issues in the A11y panel?

**Checkpoint:** Everyone has a working component with 8+ stories.

---

## Phase 4: Iterate on Your Design (30 min)

### 4.1 Request Changes

Now iterate. Talk to Claude Code naturally:

```
The success badge should use a softer green — more like emerald-500.
Also add a "pending" variant with a spinning loader icon.
Make the dismissible X button always visible on mobile, not just on hover.
```

### 4.2 Second Iteration

```
Can you add a story showing all badges in a notification panel layout?
Stack them vertically with timestamps, like a notification feed.
```

### 4.3 Review Stories

After each iteration:
1. Check that existing stories still look correct
2. Verify new stories appear in the sidebar
3. Run the **A11y** check on your new stories
4. Use **Controls** to test edge cases

### 4.4 Audit Coverage

```
/storybook review StatusBadge
```

This runs the story checklist audit — it'll tell you which story types are present and which are missing. Try to get all "Required" stories to PASS.

**Checkpoint:** Everyone has done 2-3 iteration cycles and understands the feedback loop.

---

## Phase 5: Deploy to Chromatic (15 min)

### 5.1 Push to GitHub

```bash
# Stop Storybook (Ctrl + C)

# Initialize git and push
git init
git add .
git commit -m "feat: initial design system with Button, FileUpload, and StatusBadge"
git branch -M main

# Create a repo on GitHub (follow the prompts)
gh repo create my-design-system --private --push
```

> **Note:** If you don't have `gh` CLI, create the repo on github.com and follow the push instructions.

### 5.2 Connect Chromatic

1. Go to [chromatic.com/start](https://www.chromatic.com/start)
2. Sign in with GitHub
3. Choose your `my-design-system` repo
4. Copy the project token

```bash
# Save the token
cp .env.example .env.local
# Edit .env.local → paste your CHROMATIC_PROJECT_TOKEN
```

### 5.3 Run Your First Visual Test

```bash
bun run chromatic
```

This builds your Storybook and uploads snapshots to Chromatic. Every story becomes a visual test baseline.

### 5.4 See the Visual Diff

1. Open the Chromatic URL from the terminal output
2. Browse your component snapshots
3. Each story is captured as a visual baseline

**The wow moment:** Now make a small CSS change to your component, commit, and run `bun run chromatic` again. Chromatic will highlight exactly what pixels changed.

**Checkpoint:** Everyone has seen their Storybook published on Chromatic.

---

## Phase 6: Wrap-Up (15 min)

### What You Built Today

- A **component library** with multiple UI components
- **Comprehensive stories** covering every state (default, variants, disabled, loading, error, dark mode)
- **Visual regression testing** with Chromatic baselines
- Experience with the **AI-assisted design workflow**

### The Workflow Going Forward

```
Designer describes component → AI builds it → Review in Storybook → Iterate → Push → Visual test
```

This replaces:
- Manual handoff specs (Figma redlines → developer interpretation)
- "Does it look right?" → Chromatic catches visual regressions automatically
- Waiting for developer availability → AI builds components in minutes

### Next Steps

- **Connect Figma:** Use the `/storybook create ComponentName --figma <url>` flag to build components directly from Figma designs
- **Add to your project:** Copy components from this workshop into your real codebase
- **Set up CI:** The `.github/workflows/chromatic.yml` file runs Chromatic on every push automatically

### Resources

- [Storybook docs](https://storybook.js.org/docs)
- [Chromatic docs](https://www.chromatic.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Radix UI primitives](https://www.radix-ui.com)
- [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code)

---

## Troubleshooting

### `setup.sh` fails

```bash
# Check what's missing
./setup.sh --check

# Try running again (idempotent — safe to repeat)
./setup.sh
```

### Port 6006 already in use

```bash
# Kill the existing process
lsof -ti:6006 | xargs kill -9

# Or use a different port
bun run storybook -- -p 6007
```

### Storybook shows blank page

```bash
# Rebuild
rm -rf node_modules storybook-static
bun install
bun run storybook
```

### Claude Code authentication fails

```bash
# Re-authenticate
claude auth logout
claude auth login
```

### Chromatic upload fails

- Verify your token: `cat .env.local` should show `CHROMATIC_PROJECT_TOKEN=chpt_...`
- Check your Chromatic project exists at chromatic.com
- Try: `bun run build-storybook` first to verify the build works locally

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install
```

### Hot reload not working

Save the file again, or restart Storybook (`Ctrl + C` then `bun run storybook`).
