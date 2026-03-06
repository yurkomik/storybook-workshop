import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Download, Trash2, Mail, Plus, ArrowRight, Heart, Settings, Search } from 'lucide-react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    chromatic: { delay: 200, pauseAnimationAtEnd: true },
  },
  tags: ['autodocs'],
  args: {
    children: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
      description: 'Button size',
      table: { category: 'Appearance' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
      table: { category: 'State' },
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (Radix Slot)',
      table: { category: 'Advanced' },
    },
    onClick: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/* ============================================================================
   CORE VARIANT STORIES
   ============================================================================ */

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
}

/* ============================================================================
   SIZE STORIES
   ============================================================================ */

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

/* ============================================================================
   PSEUDO-STATE STORIES
   Uses storybook-addon-pseudo-states to force CSS pseudo-classes.
   These let Chromatic capture hover/focus/active without real interaction.
   ============================================================================ */

/** Button with forced :hover pseudo-class for visual regression testing. */
export const Hover: Story = {
  args: { children: 'Hovered' },
  parameters: { pseudo: { hover: true } },
}

/** Button with forced :focus pseudo-class. */
export const Focus: Story = {
  args: { children: 'Focused' },
  parameters: { pseudo: { focus: true } },
}

/** Button with forced :active pseudo-class. */
export const Active: Story = {
  args: { children: 'Active' },
  parameters: { pseudo: { active: true } },
}

/** Button with forced :focus-visible — shows the ring indicator. */
export const FocusVisible: Story = {
  args: { children: 'Focus Visible' },
  parameters: { pseudo: { focusVisible: true } },
}

/** All 6 variants with forced :hover to compare hover effects side by side. */
export const AllVariantsHover: Story = {
  parameters: { pseudo: { hover: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const).map(
        (v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        )
      )}
    </div>
  ),
}

/* ============================================================================
   ICON BUTTON STORIES
   The CVA config defines icon, icon-sm, icon-lg sizes.
   ============================================================================ */

/** Single icon button using size="icon" — common for toolbars. */
export const IconButton: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
    children: <Plus className="size-4" />,
    'aria-label': 'Add item',
  },
}

/** Icon buttons at all three icon sizes for comparison. */
export const IconSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {([
        { size: 'icon-sm', label: 'icon-sm' },
        { size: 'icon', label: 'icon' },
        { size: 'icon-lg', label: 'icon-lg' },
      ] as const).map(({ size, label }) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Button size={size} variant="outline" aria-label={label}>
            <Settings className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  ),
}

/** Buttons with leading/trailing icons from lucide-react. */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Download /> Download
      </Button>
      <Button variant="destructive">
        <Trash2 /> Delete
      </Button>
      <Button variant="outline">
        <Mail /> Send Email
      </Button>
      <Button variant="secondary">
        <Heart /> Favorite
      </Button>
      <Button variant="ghost">
        <Search /> Search
      </Button>
      <Button>
        Continue <ArrowRight />
      </Button>
    </div>
  ),
}

/* ============================================================================
   DARK MODE
   ============================================================================ */

/** All variants and states rendered in dark mode for Chromatic regression. */
export const DarkMode: Story = {
  parameters: {
    chromatic: { forcedColors: 'none' },
  },
  decorators: [
    (Story) => (
      <div className="dark rounded-lg bg-background p-8">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="space-y-6">
      {/* Variants */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Variants
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const).map(
            (v) => (
              <Button key={v} variant={v}>
                {v}
              </Button>
            )
          )}
        </div>
      </div>
      {/* Sizes */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Sizes
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="outline" aria-label="Icon">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      {/* With Icons */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          With Icons
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button><Download /> Download</Button>
          <Button variant="destructive"><Trash2 /> Delete</Button>
          <Button variant="outline"><Mail /> Email</Button>
        </div>
      </div>
      {/* Disabled */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Disabled
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Default</Button>
          <Button variant="destructive" disabled>Destructive</Button>
          <Button variant="outline" disabled>Outline</Button>
        </div>
      </div>
    </div>
  ),
}

/* ============================================================================
   INTERACTION TESTS
   ============================================================================ */

export const ClickTest: Story = {
  args: {
    children: 'Click Me',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await step('Button is visible and enabled', async () => {
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()
    })

    await step('Click fires onClick', async () => {
      await userEvent.click(button)
      await expect(args.onClick).toHaveBeenCalledOnce()
    })
  },
}

export const DisabledClickTest: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await step('Button is visible but disabled', async () => {
      await expect(button).toBeVisible()
      await expect(button).toBeDisabled()
    })

    await step('Click does not fire onClick', async () => {
      await userEvent.click(button)
      await expect(args.onClick).not.toHaveBeenCalled()
    })
  },
}

export const KeyboardNavigation: Story = {
  args: {
    children: 'Focus Me',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await step('Tab to focus the button', async () => {
      await userEvent.tab()
      await expect(button).toHaveFocus()
    })

    await step('Enter triggers click', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(args.onClick).toHaveBeenCalledOnce()
    })
  },
}
