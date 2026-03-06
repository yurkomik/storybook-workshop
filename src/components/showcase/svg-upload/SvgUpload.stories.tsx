/* ============================================================================
   SvgUpload Stories

   14 stories for the SVG-themed upload component.
   Showcases inline SVG animations, progress rings, and particle effects.
   ============================================================================ */

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { SvgUpload } from './SvgUpload'
import { SvgDropZone } from './SvgDropZone'
import { SvgFileItem } from './SvgFileItem'
import type { SvgUploadProps, FileState, SvgUploadError } from './types'

/* ============================================================================
   META
   ============================================================================ */

const meta = {
  title: 'Showcase/SvgUpload',
  component: SvgUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    chromatic: { delay: 300, pauseAnimationAtEnd: true },
    docs: {
      description: {
        component: `
An SVG-animated file upload component featuring an inline cloud illustration
with a floating arrow, particle scatter effects on drag-over, and a progress
ring that wraps around the cloud. All animations are pure CSS \`@keyframes\`.

### Design Highlights
- **Inline SVG cloud** with hand-crafted path data
- **Floating arrow** bounces via \`@keyframes float\`
- **Particle scatter** on drag-over — 6 dots fly outward
- **Progress ring** using \`stroke-dasharray\` / \`stroke-dashoffset\`
- **Morphing checkmark** draws itself on completion
        `,
      },
    },
  },
  argTypes: {
    accept: { control: 'object', table: { category: 'Core' } },
    maxFiles: { control: { type: 'number', min: 1, max: 20 }, table: { category: 'Core' } },
    maxSizeBytes: { control: { type: 'number' }, table: { category: 'Core' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    onFilesSelected: { table: { disable: true } },
    onFileRemove: { table: { disable: true } },
    onError: { table: { disable: true } },
  },
  args: {
    maxFiles: 5,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
  },
} satisfies Meta<typeof SvgUpload>

export default meta
type Story = StoryObj<typeof meta>

/* ============================================================================
   MOCK DATA
   ============================================================================ */

function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(Math.min(size, 1024))
  return new File([buffer], name, { type, lastModified: Date.now() })
}

function createFileState(
  file: File,
  overrides: Partial<Omit<FileState, 'file'>> = {}
): FileState {
  return {
    id: crypto.randomUUID(),
    file,
    progress: 0,
    status: 'pending',
    ...overrides,
  }
}

const MOCK_FILES = {
  pdf: createMockFile('quarterly-report.pdf', 2_500_000, 'application/pdf'),
  image: createMockFile('hero-banner.png', 1_200_000, 'image/png'),
  csv: createMockFile('contacts-export.csv', 450_000, 'text/csv'),
  doc: createMockFile('proposal-v2.docx', 3_800_000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
  small: createMockFile('avatar.jpg', 85_000, 'image/jpeg'),
}

/* ============================================================================
   STATE WRAPPER for Interactive story
   ============================================================================ */

function SvgUploadWithState(props: Partial<SvgUploadProps>) {
  const [events, setEvents] = useState<string[]>([])

  const log = (msg: string) =>
    setEvents((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 10))

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-[420px]">
        <SvgUpload
          {...props}
          onFilesSelected={(files) => {
            log(`Selected ${files.length} file(s)`)
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
   PRE-POPULATED WRAPPER
   ============================================================================ */

function PrePopulated({ fileStates, disabled }: { fileStates: FileState[]; disabled?: boolean }) {
  const [files, setFiles] = useState(fileStates)

  return (
    <div className="w-[420px] space-y-3">
      <SvgDropZone
        disabled={disabled}
        onFiles={() => {}}
      />
      <div className="flex flex-col gap-2">
        {files.map((fs) => (
          <SvgFileItem
            key={fs.id}
            fileState={fs}
            disabled={disabled}
            onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          />
        ))}
      </div>
    </div>
  )
}

/* ============================================================================
   STORIES
   ============================================================================ */

/** Default empty drop zone with animated cloud and floating arrow. */
export const Default: Story = {}

/** Drag-over state with particle scatter and cloud glow. */
export const DragOver: Story = {
  render: () => (
    <div className="w-[420px]">
      <SvgDropZone forceDragOver onFiles={() => {}} />
    </div>
  ),
}

/** Files uploading with progress ring around the cloud. */
export const Uploading: Story = {
  render: () => (
    <div className="w-[420px] space-y-3">
      <SvgDropZone progress={45} isUploading onFiles={() => {}} />
      <div className="flex flex-col gap-2">
        <SvgFileItem
          fileState={createFileState(MOCK_FILES.pdf, { status: 'uploading', progress: 25 })}
        />
        <SvgFileItem
          fileState={createFileState(MOCK_FILES.image, { status: 'uploading', progress: 68 })}
        />
      </div>
    </div>
  ),
}

/** All uploads complete with morphing checkmarks. */
export const UploadComplete: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.pdf, { status: 'complete', progress: 100 }),
        createFileState(MOCK_FILES.image, { status: 'complete', progress: 100 }),
        createFileState(MOCK_FILES.small, { status: 'complete', progress: 100 }),
      ]}
    />
  ),
}

/** Error state with X icon on failed files. */
export const Error: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.pdf, { status: 'error', error: 'Upload failed: network timeout' }),
        createFileState(MOCK_FILES.image, { status: 'error', error: 'File exceeds the 10 MB limit' }),
      ]}
    />
  ),
}

/** Multiple files in various states. */
export const MultipleFiles: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.pdf, { status: 'complete', progress: 100 }),
        createFileState(MOCK_FILES.image, { status: 'uploading', progress: 55 }),
        createFileState(MOCK_FILES.csv, { status: 'pending' }),
        createFileState(MOCK_FILES.doc, { status: 'error', error: 'Upload failed' }),
      ]}
    />
  ),
}

/** All possible states displayed together for visual comparison. */
export const AllStates: Story = {
  render: () => (
    <div className="w-[420px] space-y-2">
      <SvgFileItem fileState={createFileState(MOCK_FILES.csv, { status: 'pending' })} />
      <SvgFileItem fileState={createFileState(MOCK_FILES.pdf, { status: 'uploading', progress: 42 })} />
      <SvgFileItem fileState={createFileState(MOCK_FILES.image, { status: 'complete', progress: 100 })} />
      <SvgFileItem fileState={createFileState(MOCK_FILES.doc, { status: 'error', error: 'Network error' })} />
    </div>
  ),
}

/** Fully interactive — drop files and watch the SVG animations. */
export const Interactive: Story = {
  render: (args) => <SvgUploadWithState {...args} />,
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
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.pdf, { status: 'complete', progress: 100 }),
        createFileState(MOCK_FILES.image, { status: 'uploading', progress: 55 }),
        createFileState(MOCK_FILES.doc, { status: 'error', error: 'Upload failed' }),
      ]}
    />
  ),
}

/** Responsive: different container widths. */
export const Responsive: Story = {
  parameters: { chromatic: { viewports: [320, 640, 1024] }, layout: 'fullscreen' },
  render: () => (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 p-4 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Narrow (320px)</p>
        <div className="w-[300px]">
          <SvgUpload maxFiles={3} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Wide</p>
        <SvgUpload maxFiles={3} />
      </div>
    </div>
  ),
}

/** Disabled state. */
export const Disabled: Story = {
  args: { disabled: true },
}

/** All controls exposed for exploration. */
export const Playground: Story = {
  args: {
    maxFiles: 5,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
    accept: ['.pdf', '.png', '.jpg', 'image/*'],
  },
}

/** Interaction test: simulate drag-and-drop. */
export const DragDropTest: Story = {
  args: { maxFiles: 3 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Drop zone is visible', async () => {
      const text = canvas.getByText(/drag.*drop/i)
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
    const canvas = within(canvasElement)

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
