#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Storybook Workshop — Environment Setup Script
#
# Usage:
#   ./setup.sh           # Check + install missing deps + bun install
#   ./setup.sh --check   # Verify-only mode (no installs)
#   ./setup.sh --help    # Show usage
#
# Idempotent: safe to run multiple times. Only installs what's missing.
# Supports: macOS, Linux (Windows: use WSL)
# ============================================================================

CHECK_ONLY=false
NO_OPEN=false

for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=true ;;
    --no-open) NO_OPEN=true ;;
    --help|-h)
      echo "Usage: ./setup.sh [--check] [--no-open]"
      echo "  --check    Verify dependencies only (no installs)"
      echo "  --no-open  Don't open Storybook after setup"
      exit 0
      ;;
  esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ok()   { echo -e "  ${GREEN}$1${NC}  $2"; }
warn() { echo -e "  ${YELLOW}$1${NC}  $2"; }
fail() { echo -e "  ${RED}$1${NC}  $2"; }
info() { echo -e "${BLUE}$1${NC}"; }

NEEDS_SHELL_RELOAD=false
ALL_OK=true

# ============================================================================
# Ensure ~/.zshrc exists (clean macOS may not have one)
# ============================================================================
ensure_shell_profile() {
  local profile="${HOME}/.zshrc"
  if [[ "$SHELL" == *"bash"* ]]; then
    profile="${HOME}/.bashrc"
  fi
  if [[ ! -f "$profile" ]]; then
    touch "$profile"
  fi
  echo "$profile"
}

SHELL_PROFILE=$(ensure_shell_profile)

# ============================================================================
# Reload PATH from shell profile
# ============================================================================
reload_path() {
  # Source common locations that curl installers write to
  [[ -f "$HOME/.zshrc" ]] && source "$HOME/.zshrc" 2>/dev/null || true
  [[ -f "$HOME/.bashrc" ]] && source "$HOME/.bashrc" 2>/dev/null || true
  [[ -f "$HOME/.local/share/fnm/fnm_multishell" ]] && eval "$(fnm env)" 2>/dev/null || true
  [[ -d "$HOME/.bun/bin" ]] && export PATH="$HOME/.bun/bin:$PATH"
  [[ -d "$HOME/.claude" ]] && export PATH="$HOME/.claude/local/bin:$PATH"
  export PATH="$HOME/.local/bin:$PATH"
}

# ============================================================================
# 1. Git
# ============================================================================
info "🔍 Checking dependencies..."
echo ""

if command -v git &>/dev/null; then
  ok "✓" "git      $(git --version | awk '{print $3}')"
else
  if $CHECK_ONLY; then
    fail "✗" "git      not found"
    ALL_OK=false
  else
    warn "⟳" "git      installing via Xcode CLI tools..."
    xcode-select --install 2>/dev/null || true
    echo "    → Accept the Xcode CLI tools dialog, then re-run ./setup.sh"
    exit 1
  fi
fi

# ============================================================================
# 2. fnm (Fast Node Manager)
# ============================================================================
reload_path
if command -v fnm &>/dev/null; then
  ok "✓" "fnm      $(fnm --version | awk '{print $2}')"
elif command -v node &>/dev/null; then
  NODE_PRE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
  if [[ "$NODE_PRE_MAJOR" -ge 22 ]]; then
    ok "✓" "fnm      skipped (node v22+ already available)"
  elif $CHECK_ONLY; then
    fail "✗" "fnm      not found (needed to install node v22+)"
    ALL_OK=false
  else
    warn "⟳" "fnm      installing (need node v22+)..."
    curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell
    if ! grep -q "fnm env" "$SHELL_PROFILE" 2>/dev/null; then
      echo '' >> "$SHELL_PROFILE"
      echo '# fnm (Fast Node Manager)' >> "$SHELL_PROFILE"
      echo 'eval "$(fnm env --use-on-cd)"' >> "$SHELL_PROFILE"
    fi
    NEEDS_SHELL_RELOAD=true
    reload_path
    eval "$(fnm env --use-on-cd)" 2>/dev/null || true
    ok "✓" "fnm      $(fnm --version | awk '{print $2}')  (installed)"
  fi
else
  if $CHECK_ONLY; then
    fail "✗" "fnm      not found"
    ALL_OK=false
  else
    warn "⟳" "fnm      installing..."
    curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell
    # Add fnm to shell profile if not already there
    if ! grep -q "fnm env" "$SHELL_PROFILE" 2>/dev/null; then
      echo '' >> "$SHELL_PROFILE"
      echo '# fnm (Fast Node Manager)' >> "$SHELL_PROFILE"
      echo 'eval "$(fnm env --use-on-cd)"' >> "$SHELL_PROFILE"
    fi
    NEEDS_SHELL_RELOAD=true
    reload_path
    eval "$(fnm env --use-on-cd)" 2>/dev/null || true
    ok "✓" "fnm      $(fnm --version | awk '{print $2}')  (installed)"
  fi
fi

# ============================================================================
# 3. Node.js 22
# ============================================================================
reload_path
if command -v fnm &>/dev/null; then
  eval "$(fnm env --use-on-cd)" 2>/dev/null || true
fi

NEED_NODE=false
if command -v node &>/dev/null; then
  NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
  if [[ "$NODE_MAJOR" -ge 22 ]]; then
    ok "✓" "node     $(node --version)"
  else
    NEED_NODE=true
  fi
else
  NEED_NODE=true
fi

if $NEED_NODE; then
  if $CHECK_ONLY; then
    fail "✗" "node     v22+ required"
    ALL_OK=false
  else
    warn "⟳" "node     installing v22 via fnm..."
    fnm install 22
    fnm default 22
    eval "$(fnm env --use-on-cd)" 2>/dev/null || true
    ok "✓" "node     $(node --version)  (installed)"
  fi
fi

# ============================================================================
# 4. bun
# ============================================================================
reload_path
if command -v bun &>/dev/null; then
  ok "✓" "bun      $(bun --version)"
else
  if $CHECK_ONLY; then
    fail "✗" "bun      not found"
    ALL_OK=false
  else
    warn "⟳" "bun      installing..."
    curl -fsSL https://bun.sh/install | bash
    NEEDS_SHELL_RELOAD=true
    reload_path
    ok "✓" "bun      $(bun --version)  (installed)"
  fi
fi

# ============================================================================
# 5. Claude Code
# ============================================================================
reload_path
if command -v claude &>/dev/null; then
  ok "✓" "claude   $(claude --version 2>/dev/null | head -1 || echo 'installed')"
else
  if $CHECK_ONLY; then
    fail "✗" "claude   not found"
    ALL_OK=false
  else
    warn "⟳" "claude   installing..."
    curl -fsSL https://claude.ai/install.sh | bash
    NEEDS_SHELL_RELOAD=true
    reload_path
    ok "✓" "claude   installed"
  fi
fi

# ============================================================================
# 6. Antigravity IDE (check only — manual install required)
# ============================================================================
ANTIGRAVITY_FOUND=false
if [[ -d "/Applications/Antigravity.app" ]] || [[ -d "$HOME/Applications/Antigravity.app" ]]; then
  ok "✓" "IDE      Antigravity detected"
  ANTIGRAVITY_FOUND=true
elif [[ -d "/Applications/Visual Studio Code.app" ]] || [[ -d "/Applications/Cursor.app" ]]; then
  ok "✓" "IDE      VS Code / Cursor detected (Antigravity recommended)"
  ANTIGRAVITY_FOUND=true
else
  if $CHECK_ONLY; then
    warn "?" "IDE      no compatible IDE found"
  else
    warn "?" "IDE      opening Antigravity download page..."
    open "https://antigravity.google" 2>/dev/null || echo "    → Download from: https://antigravity.google"
  fi
fi

echo ""

# ============================================================================
# Check-only mode: report and exit
# ============================================================================
if $CHECK_ONLY; then
  echo ""
  if $ALL_OK; then
    info "✅ All dependencies present."
  else
    info "❌ Missing dependencies. Run ./setup.sh to install."
    exit 1
  fi
  exit 0
fi

# ============================================================================
# 7. Install project dependencies
# ============================================================================
info "📦 Installing project dependencies..."
reload_path
cd "$(dirname "$0")"
bun install
echo -e "  ${GREEN}✓${NC}  bun install complete"

echo ""

# ============================================================================
# 8. Summary
# ============================================================================
info "✅ Ready! Run: bun run storybook"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Run 'claude' in terminal and authenticate with your Anthropic account"
if ! $ANTIGRAVITY_FOUND; then
  echo "  2. Install Antigravity IDE from https://antigravity.google"
  echo "     Then install Claude Code extension: Cmd+Shift+X → search 'Claude Code'"
else
  echo "  2. Install Claude Code extension in your IDE: Cmd+Shift+X → search 'Claude Code'"
fi
echo "  3. Copy .env.example → .env.local and add your Chromatic token (optional)"
echo ""

if $NEEDS_SHELL_RELOAD; then
  echo -e "${YELLOW}Note:${NC} New tools were installed. Restart your terminal or run:"
  echo "  source $SHELL_PROFILE"
  echo ""
fi

# ============================================================================
# 9. Optionally open Storybook
# ============================================================================
if ! $NO_OPEN; then
  read -p "Open Storybook now? [Y/n] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    bun run storybook
  fi
fi
