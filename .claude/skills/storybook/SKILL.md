---
name: storybook
description: |
  Design system toolkit for Storybook component development.
  Creates components, writes story suites, reviews quality, runs Chromatic.
  Use when building UI components, writing stories, or managing visual tests.
argument-hint: "create <ComponentName> | stories <ComponentName> | review <ComponentName> | setup | chromatic [run|status]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Storybook Component Development Skill

You are an AI agent helping designers build UI components with Storybook. The designer describes what they want in natural language — you create the component and all stories.

## Commands

### `create <ComponentName> [--type=ui|showcase] [--figma <url>]`
Create a new component + full story suite.

1. Ask the designer to describe the component (unless description is provided)
2. Create component file(s) in `src/components/<type>/<component-name>/`
3. Create story file following the **Story Checklist** below
4. Run `bun run storybook` build to validate

**Type:**
- `ui` → `src/components/ui/<name>.tsx` (simple, reusable — like Button, Input)
- `showcase` → `src/components/showcase/<name>/` (complex, multi-file — like FileUpload)

**Figma integration:** If `--figma <url>` is provided and Figma MCP is available:
1. Call `get_design_context` with the Figma node → get screenshot + reference code
2. Adapt the design to this project's shadcn/Tailwind conventions
3. Create component matching the Figma design + full story suite

### `stories <ComponentName>`
Generate or regenerate stories for an existing component.

1. Find the component file(s)
2. Analyze props interface and component behavior
3. Run Story Checklist diff against existing stories
4. Add missing story types, update existing stories if component changed

### `review <ComponentName>`
Audit stories against the checklist.

1. Read component + story files
2. Check each item in the Story Checklist
3. Report: PASS / MISSING / NEEDS UPDATE
4. Check a11y coverage, responsive stories, dark mode

### `setup`
Validate project configuration.

1. Check `.storybook/main.ts` — addons present
2. Check `.storybook/preview.ts` — dark mode, decorators
3. Check `package.json` — all deps installed
4. Check Chromatic connection (`.env.local` has token)

### `chromatic [run|status]`
- `run` → Execute `bun run chromatic`
- `status` → Check last Chromatic build status

---

## Story Checklist

When creating stories for ANY component, follow this checklist.

### Required Stories (always create)

| Story | Description | When to skip |
|-------|-------------|-------------|
| **Default** | Component with default props | Never |
| **AllVariants** | Grid showing every variant/size combo | Single-variant components |
| **Interactive** | State wrapper + live controls + debug panel | Stateless components |
| **Disabled** | All disabled states | No disabled prop |
| **Loading** | Skeleton/spinner states | No loading state |
| **Error** | Error states with messages | No error state |
| **Empty** | Empty/no-data state | No empty state |
| **DarkMode** | Explicit dark mode snapshot for Chromatic | Never |

### Recommended Stories (create when relevant)

| Story | Description |
|-------|-------------|
| **WithIcons** | Icon placement variations |
| **Responsive** | Mobile/tablet/desktop side-by-side |
| **LongContent** | Text overflow, truncation behavior |
| **EdgeCases** | Boundary values, special characters, Unicode |
| **Composition** | Component used inside other components |
| **Playground** | All controls exposed for free exploration |

---

## Story Conventions

### File Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ComponentName } from './ComponentName'

/* ============================================================================
   MOCK DATA
   - Keep inline (< 500 lines). Extract to .mocks.ts if shared with tests.
   - Organize by SECTIONS with comment headers.
   ============================================================================ */

// SECTION 1: Primary mock data (realistic)
const mockItems = [...]

// SECTION 2: Edge case datasets
const mockLongNames = [...]
const mockSpecialChars = [...]

// SECTION 3: Factory function (bulk generation for stress tests)
function createMockItems(count: number) { ... }

/* ============================================================================
   META
   ============================================================================ */

const meta = {
  title: 'UI/ComponentName',        // or 'Showcase/ComponentName'
  component: ComponentName,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# ComponentName

Brief description of what this component does and when to use it.

## Features
- Feature 1
- Feature 2
        `
      }
    }
  },
  argTypes: {
    // Group by category
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } }
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the component',
      table: { category: 'State' }
    },
    // Hide callbacks from Controls panel
    onChange: { table: { disable: true } },
    onClick: { table: { disable: true } },
  },
  args: {
    variant: 'default',
    disabled: false,
  },
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>

/* ============================================================================
   STATE WRAPPER (for Interactive stories)
   ============================================================================ */

const ComponentWithState = (props: Partial<ComponentProps>) => {
  const [value, setValue] = useState('')

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Component Card */}
      <div className="w-[320px] sm:w-[400px] min-h-[140px] p-4 border rounded-lg bg-background">
        <ComponentName
          value={value}
          onChange={setValue}
          {...props}
        />
      </div>

      {/* Debug State Display */}
      <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
        <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">State</p>
        <p>value: {JSON.stringify(value)}</p>
      </div>
    </div>
  )
}

/* ============================================================================
   STORIES
   ============================================================================ */

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  render: (args) => <ComponentWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive story with live state management and debug panel.'
      }
    }
  }
}
```

### Key Rules

1. **Always use `satisfies Meta<typeof Component>`** — never `as Meta`
2. **Title format:** `'UI/ComponentName'` (simple) or `'Showcase/ComponentName'` (complex)
3. **Always include `tags: ['autodocs']`** — auto-generates docs page
4. **Always provide `docs.description.component`** with markdown
5. **Mock data inline** (< 500 lines), organized by SECTIONS with comments
6. **State wrapper pattern** for interactive stories (useState + debug panel)
7. **argTypes grouped** by `table: { category: '...' }`
8. **Hide callbacks** with `table: { disable: true }`
9. **Chromatic viewports** for responsive stories: `[320, 640, 1024]`

### argTypes Reference

```typescript
// Select dropdown
variant: { control: 'select', options: ['a', 'b', 'c'] }

// Inline radio buttons (compact)
size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }

// Boolean checkbox
disabled: { control: 'boolean' }

// Number with range
maxItems: { control: { type: 'number', min: 1, max: 100, step: 1 } }

// Conditional visibility (show only when variant is 'multiple')
maxSelected: {
  control: { type: 'range', min: 1, max: 10 },
  if: { arg: 'variant', eq: 'multiple' }
}

// Categorize in Controls panel
prop: { table: { category: 'Appearance', defaultValue: { summary: 'default' } } }

// Hide from Controls panel
onEvent: { table: { disable: true } }
```

### Responsive Demo Pattern

```typescript
export const Responsive: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded">Mobile</span>
        <div className="w-[280px] p-3 border rounded-lg">
          <ComponentName compact />
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">Tablet</span>
        <div className="w-[400px] p-3 border rounded-lg">
          <ComponentName />
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900 rounded">Desktop</span>
        <div className="w-[600px] p-3 border rounded-lg">
          <ComponentName />
        </div>
      </div>
    </div>
  ),
  parameters: {
    chromatic: { viewports: [320, 640, 1024] },
    layout: 'fullscreen',
  }
}
```

---

## Component Conventions

### File Organization

**Simple (ui):** Single file
```
src/components/ui/button.tsx
src/components/ui/button.stories.tsx
```

**Complex (showcase):** Directory with sub-components
```
src/components/showcase/file-upload/
  types.ts                    # Shared types and interfaces
  DropZone.tsx                # Sub-component
  FileItem.tsx                # Sub-component
  FileList.tsx                # Sub-component
  FileUpload.tsx              # Main orchestrator
  FileUpload.stories.tsx      # Stories
```

### Styling

- **Tailwind v4** with theme CSS variables (`bg-background`, `text-foreground`, etc.)
- **CVA** (class-variance-authority) for component variants
- **cn()** from `@/lib/utils` for conditional class composition
- **Lucide React** for icons
- **Radix UI** for accessible primitives (Dialog, Popover, Progress, etc.)

### Component Template

```typescript
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const componentVariants = cva(
  'base-classes-here',
  {
    variants: {
      variant: {
        default: 'variant-classes',
        outline: 'variant-classes',
      },
      size: {
        sm: 'size-classes',
        md: 'size-classes',
        lg: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface ComponentProps extends VariantProps<typeof componentVariants> {
  className?: string
  children?: React.ReactNode
}

export function Component({ variant, size, className, children }: ComponentProps) {
  return (
    <div className={cn(componentVariants({ variant, size }), className)}>
      {children}
    </div>
  )
}
```

---

## Workflow Integration

When this skill is used as part of a larger development workflow:

1. **Component changes** → run `stories <ComponentName>` to update stories
2. **New component** → run `create <ComponentName>` to scaffold everything
3. **Pre-commit** → run `review <ComponentName>` to check story coverage
4. **CI** → Chromatic runs automatically on push via GitHub Actions
