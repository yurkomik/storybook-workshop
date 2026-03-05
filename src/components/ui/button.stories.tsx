import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
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
      options: ['default', 'sm', 'lg', 'icon'],
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
   STORIES
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
