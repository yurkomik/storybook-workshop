# Storybook Workshop — Facilitator Notes

> Internal guide for running the 2.5-hour workshop. Keep this file out of participant-facing materials.

---

## Before the Workshop

### One Week Before
- [ ] Send pre-workshop checklist (GitHub, Chromatic, Anthropic accounts)
- [ ] Create GitHub template repo from this project
- [ ] Test `setup.sh` on a clean machine (or VM) end to end
- [ ] Verify Chromatic free tier limits (5,000 snapshots/month — sufficient for ~10 participants)
- [ ] Prepare screen share with Storybook open on the FileUpload component

### Day Before
- [ ] Run `./setup.sh --check` on the workshop machine
- [ ] Pre-build Storybook: `bun run build-storybook` (catches dependency issues early)
- [ ] Have backup WiFi hotspot (curl installers need internet)
- [ ] Clone the template fresh and run through Phase 1-3 yourself (15 min)

### Room Setup
- Projector/screen for demos
- Everyone on same WiFi network
- Power strips — setup.sh downloads ~200MB of packages

---

## Time Budget

| Phase | Duration | Buffer | Notes |
|-------|----------|--------|-------|
| 1. Setup | 30 min | +10 min | Most variable — depends on network speed |
| 2. Explore | 15 min | +5 min | Quick, mostly demo-driven |
| _Break_ | _5 min_ | | |
| 3. Create | 45 min | +10 min | Core exercise — let people experiment |
| 4. Iterate | 30 min | +5 min | Can compress if Phase 3 runs long |
| _Break_ | _5 min_ | | |
| 5. Deploy | 15 min | +5 min | Optional — skip if time is tight |
| 6. Wrap | 15 min | — | Q&A fills remaining time naturally |

**Total:** 2h 30min + 35min buffer = ~3h worst case

---

## Phase-by-Phase Facilitator Notes

### Phase 1: Setup

**Common blockers:**
- macOS Gatekeeper blocking `setup.sh` → right-click → Open, or `chmod +x setup.sh`
- Corporate firewalls blocking curl installs → have USB drive with pre-downloaded installers
- `fnm` not found after install → `source ~/.zshrc` or restart terminal
- Xcode CLI tools dialog → accept it, wait 2-5 min, re-run `setup.sh`

**Fallback:** If someone can't install, pair them with a neighbor. Setup issues shouldn't block the whole group.

**Demo tip:** Run `setup.sh` on your own machine first (it'll skip everything = fast), then show the output to explain what it checks.

### Phase 2: Explore

**Script for live demo:**
1. Open Button → Default. "This is the simplest story — just the component with default props."
2. Open Controls panel. Change `variant` to `destructive`. "Controls let you try every combination without code."
3. Open Docs tab. "Documentation is auto-generated from the component's TypeScript types."
4. Open A11y tab. "This runs WCAG checks. Real-time accessibility testing."
5. Open FileUpload → Interactive. Drag a fake file. "Complex components have state wrappers with debug panels."
6. Open FileUpload → Responsive. "Three viewports side by side — Chromatic snapshots all of these."

**Key message:** "Every state is a story. If you can describe it, we can test it."

### Phase 3: Create (The Wow Moment)

**This is where engagement peaks.** The AI creating 10+ stories from a natural language description is the "magic moment."

**Tips:**
- Let participants choose their own component (more engaging than everyone doing the same thing)
- If someone is stuck on ideas, suggest: StatusBadge, NotificationToast, PricingCard, UserCard, ProgressStepper
- Walk around and help anyone whose AI prompt isn't specific enough
- Show your screen occasionally — narrate what Claude Code is doing ("It's creating the variant system... now writing the loading story... running the build...")

**If Claude Code is slow/unavailable:**
- Pre-built fallback: the FileUpload component is already in the template. Walk through its stories as if it was just created.
- "Let me show you what the AI would produce" → open FileUpload.stories.tsx and walk through the story structure

**Common issues:**
- "Claude says it can't find the skill" → make sure they're in the project directory (`cd my-design-system`)
- Import errors after creation → `bun install` may need re-running if new deps were added
- Storybook not hot-reloading → save the story file again, or restart Storybook

### Phase 4: Iterate

**Guided iteration prompts** (for participants who aren't sure what to change):
1. "Change the color palette — use your brand colors instead"
2. "Add a new variant that doesn't exist yet"
3. "Make it responsive — add a compact version for mobile"
4. "Add an animation or transition"

**Key teaching moment:** After the second iteration, run `/storybook review [ComponentName]`. Show the coverage report. This connects the dots: "The AI follows a checklist. You can audit what's covered."

### Phase 5: Deploy

**If time is short:** Do this as a group demo instead of individual exercise. Push your own repo, run Chromatic, show the dashboard.

**The second wow moment:** Make a 1-line CSS change (e.g., change a border-radius), commit, run Chromatic again. Show the pixel diff. "This catches every visual regression automatically."

**If Chromatic is down or account issues:** Skip to wrap-up. The visual diff concept can be explained without a live demo.

### Phase 6: Wrap-Up

**Key messages to reinforce:**
1. "You just built production-quality components without writing code"
2. "Every state is captured and tested — no more 'it works on my machine'"
3. "The AI follows the same checklist every time — consistent quality"
4. "Chromatic catches things humans miss — pixel-level regression detection"

**Common questions and answers:**

Q: "Can we use this with Material UI / Chakra / Ant Design instead of Tailwind?"
A: "Yes — the story patterns are framework-agnostic. You'd swap the styling approach but the stories, controls, and Chromatic flow work the same way."

Q: "How does this connect to our actual Figma designs?"
A: "The `/storybook create --figma <url>` flag pulls design context from Figma. It reads the layout, colors, spacing and generates matching code. We'll cover this in a follow-up session."

Q: "Who reviews the AI-generated code?"
A: "The AI generates it, Storybook lets you visually verify, and Chromatic catches regressions. For production use, a developer reviews the PR before merge."

Q: "Is this replacing developers?"
A: "No — it's extending designers. You can now prototype and validate components yourself. Developers focus on integration, performance, and complex logic."

Q: "How much does Chromatic cost?"
A: "Free tier: 5,000 snapshots/month. For a design system with ~50 components and 10 stories each, that's ~10 full test runs per month. Paid plans scale from there."

---

## Post-Workshop

- [ ] Share the template repo URL for participants to keep
- [ ] Send link to Storybook docs and Claude Code docs
- [ ] Collect feedback (what was confusing, what was exciting)
- [ ] Schedule follow-up session for Figma integration (if interest)
- [ ] Add participants to the Chromatic project for ongoing visual reviews
