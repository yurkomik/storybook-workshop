/* ============================================================================
   FolderUpload Stories

   Showcases the morphing-folder upload component with CSS 3D transforms.
   The folder back panel tilts open on drag-over, and a file card slides into
   the gap on drop — creating the illusion of filing a document.
   ============================================================================ */

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { FolderUpload } from './FolderUpload'
import { FolderDropZone } from './FolderDropZone'
import type { FolderUploadProps } from './types'

/* ============================================================================
   META
   ============================================================================ */

const meta = {
  title: 'Showcase/FolderUpload',
  component: FolderUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    chromatic: { delay: 300, pauseAnimationAtEnd: true },
    docs: {
      description: {
        component: `
A morphing-folder file upload component. The folder SVG opens (back panel tilts
away via CSS 3D transforms) when a file is dragged over, creating a gap for the
file card to slide into.

### Design Highlights
- **CSS 3D transforms** — \`perspective: 800px\` + \`rotateX(-20deg)\` on the back panel
- **Layered div architecture** — back panel, file card, and front panel as separate elements
- **Purple OKLCH palette** — consistent with the design system's color tokens
- **File card slide-in** — cubic-bezier spring animation on drop
- **Radial glow** — pulsing purple gradient on drag hover
        `,
      },
    },
  },
  argTypes: {
    accept: { control: 'object', table: { category: 'Core' } },
    maxFiles: { control: { type: 'number', min: 1, max: 20 }, table: { category: 'Core' } },
    maxSizeBytes: { control: { type: 'number' }, table: { category: 'Core' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    label: { control: 'text', table: { category: 'Appearance' } },
    sublabel: { control: 'text', table: { category: 'Appearance' } },
    onFilesSelected: { table: { disable: true } },
    onFileRemove: { table: { disable: true } },
    onError: { table: { disable: true } },
  },
  args: {
    maxFiles: 5,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
  },
} satisfies Meta<typeof FolderUpload>

export default meta
type Story = StoryObj<typeof meta>

/* ============================================================================
   MOCK DATA
   ============================================================================ */

function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(Math.min(size, 1024))
  return new File([buffer], name, { type, lastModified: Date.now() })
}

const MOCK_FILES = {
  pdf: createMockFile('quarterly-report.pdf', 2_500_000, 'application/pdf'),
  image: createMockFile('hero-banner.png', 1_200_000, 'image/png'),
  csv: createMockFile('contacts-export.csv', 450_000, 'text/csv'),
  doc: createMockFile('proposal-v2.docx', 3_800_000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
}

/* ============================================================================
   STATE WRAPPER for Interactive story
   ============================================================================ */

function FolderUploadWithState(props: Partial<FolderUploadProps>) {
  const [events, setEvents] = useState<string[]>([])

  const log = (msg: string) =>
    setEvents((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 10))

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-[420px]">
        <FolderUpload
          {...props}
          onFilesSelected={(files) => {
            log(`Selected ${files.length} file(s): ${files.map((f) => f.name).join(', ')}`)
            props.onFilesSelected?.(files)
          }}
          onFileRemove={(id) => {
            log(`Removed ${id.slice(0, 8)}...`)
            props.onFileRemove?.(id)
          }}
          onError={(error) => {
            log(`Error: ${error.message}`)
            props.onError?.(error)
          }}
        />
      </div>
      {events.length > 0 && (
        <div className="w-[420px] rounded-md border border-dashed border-border bg-secondary/50 p-3 font-mono text-xs text-muted-foreground">
          <p className="mb-1 text-[10px] uppercase tracking-wider">Event Log</p>
          {events.map((msg, i) => <p key={i}>{msg}</p>)}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
   STORIES
   ============================================================================ */

/** Default empty state — closed folder with floating upload arrow. */
export const Default: Story = {}

/** Drag-over state — folder opens with back panel tilted and purple glow. */
export const DragOver: Story = {
  render: () => (
    <div className="w-[420px]">
      <FolderDropZone forceDragOver onFiles={() => {}} />
    </div>
  ),
}

/** File card visible inside the folder — simulates the post-drop moment. */
export const WithFile: Story = {
  render: () => (
    <div className="w-[420px]">
      <FolderDropZone
        showFileCard
        fileCardName="Research.pdf"
        onFiles={() => {}}
      />
    </div>
  ),
}

/** Folder open with file card sliding in — the full morph effect. */
export const FolderOpenWithFile: Story = {
  render: () => (
    <div className="w-[420px]">
      <FolderDropZone
        forceDragOver
        showFileCard
        fileCardName="Quarterly-Report.pdf"
        onFiles={() => {}}
      />
    </div>
  ),
}

/** Fully interactive — drop files and watch the folder morph animation. */
export const Interactive: Story = {
  render: (args) => <FolderUploadWithState {...args} />,
}

/** Dark mode rendering. */
export const DarkMode: Story = {
  parameters: { chromatic: { forcedColors: 'none' } },
  decorators: [
    (Story) => (
      <div className="dark rounded-lg bg-background p-6">
        <Story />
      </div>
    ),
  ],
}

/** Error state — folder turns red with shake animation and X icon. */
export const Error: Story = {
  render: () => (
    <div className="w-[420px]">
      <FolderDropZone
        forceError
        errorMessage="&quot;backup.exe&quot; is not an accepted type. Accepted: .pdf, .csv"
        onFiles={() => {}}
      />
    </div>
  ),
}

/** Error state with folder open — drag-over + error simultaneously. */
export const ErrorDragOver: Story = {
  render: () => (
    <div className="w-[420px]">
      <FolderDropZone
        forceDragOver
        forceError
        errorMessage="Maximum 3 files allowed. 3 already selected."
        onFiles={() => {}}
      />
    </div>
  ),
}

/** Interactive error — try dropping a .txt file with accept=['.pdf']. */
export const InteractiveError: Story = {
  render: (args) => <FolderUploadWithState {...args} accept={['.pdf']} />,
}

/** Disabled state — muted visuals, no interaction. */
export const Disabled: Story = {
  args: { disabled: true },
}

/** Custom labels on the folder. */
export const CustomLabels: Story = {
  args: {
    label: 'Upload invoices',
    sublabel: 'PDF or CSV, up to 5MB each',
    accept: ['.pdf', '.csv'],
  },
}

/** All controls exposed for exploration. */
export const Playground: Story = {
  args: {
    maxFiles: 5,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
    accept: ['.pdf', '.png', '.jpg', 'image/*'],
    label: 'Drop files into the folder',
    sublabel: 'or click to browse',
  },
}

/** Interaction test: simulate drag-and-drop. */
export const DragDropTest: Story = {
  args: { maxFiles: 3 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Drop zone is visible', async () => {
      const text = canvas.getByText(/drop files/i)
      await expect(text).toBeVisible()
    })

    await step('Simulate dropping a file', async () => {
      const dropTarget = canvasElement.querySelector('[role="button"]')!
      const file = new File(['content'], 'test-doc.pdf', { type: 'application/pdf' })
      const dt = new DataTransfer()
      dt.items.add(file)
      dropTarget.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }))
      dropTarget.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true }))
      dropTarget.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }))
    })

    await step('File appears in list', async () => {
      const name = await canvas.findByText('test-doc.pdf')
      await expect(name).toBeVisible()
    })
  },
}

/** Accessibility test: verify ARIA attributes and keyboard navigation. */
export const AccessibilityTest: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Drop zone has accessible label', async () => {
      const dropZone = canvasElement.querySelector('[role="button"]')!
      await expect(dropZone.getAttribute('aria-label')).toBe('Drop files here or click to browse')
    })

    await step('Hidden file input exists', async () => {
      const input = canvasElement.querySelector('input[type="file"]')
      await expect(input).toBeTruthy()
    })

    await step('Drop zone is focusable', async () => {
      await userEvent.tab()
      const dropZone = canvasElement.querySelector('[role="button"]')!
      await expect(dropZone).toHaveFocus()
    })
  },
}
