/* ============================================================================
   ScifiUpload Stories

   16 stories for the cyberpunk terminal upload component.
   ============================================================================ */

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ScifiUpload } from './ScifiUpload'
import { ScifiDropZone } from './ScifiDropZone'
import { ScifiFileItem } from './ScifiFileItem'
import type { ScifiUploadProps, ScifiFileState, ScifiUploadError } from './types'

/* ============================================================================
   META
   ============================================================================ */

const meta = {
  title: 'Showcase/ScifiUpload',
  component: ScifiUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    chromatic: { delay: 300, pauseAnimationAtEnd: true },
    docs: {
      description: {
        component: `
A cyberpunk terminal-themed file upload with neon glows, glassmorphism,
scanlines, holographic progress, and matrix-style text.

### Visual Effects (all CSS-only)
- **Glassmorphism** drop zone with \`backdrop-blur\` and \`bg-white/5\`
- **Corner accents**: L-shaped neon lines via CSS pseudo-elements
- **Scanline**: Horizontal bar sweeping top to bottom
- **Text flicker** and **cursor blink** animations
- **Neon border** shifts cyan → magenta on drag-over
- **Glitch** animation with horizontal displacement on errors
- **Ambient particles**: 20+ floating dots with staggered delays
- **Two-phase upload**: SCANNING → TRANSMITTING → VERIFIED

### Custom OKLCH Palette
\`--scifi-cyan: oklch(75% 0.15 195)\`
\`--scifi-magenta: oklch(65% 0.25 330)\`
\`--scifi-dark-bg: oklch(12% 0.02 260)\`
\`--scifi-neon-green: oklch(80% 0.2 145)\`
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
    maxFiles: 10,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
  },
} satisfies Meta<typeof ScifiUpload>

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
  overrides: Partial<Omit<ScifiFileState, 'file'>> = {}
): ScifiFileState {
  return {
    id: crypto.randomUUID(),
    file,
    progress: 0,
    status: 'pending',
    ...overrides,
  }
}

const MOCK = {
  data: createMockFile('neural-net-weights.bin', 4_500_000, 'application/octet-stream'),
  log: createMockFile('system-access.log', 250_000, 'text/plain'),
  key: createMockFile('encryption-key.pem', 3_200, 'application/x-pem-file'),
  archive: createMockFile('sector-7g-backup.tar.gz', 8_900_000, 'application/gzip'),
  image: createMockFile('holographic-map.png', 1_200_000, 'image/png'),
}

/* ============================================================================
   STATE WRAPPER
   ============================================================================ */

function ScifiUploadWithState(props: Partial<ScifiUploadProps>) {
  const [events, setEvents] = useState<string[]>([])

  const log = (msg: string) =>
    setEvents((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 10))

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[480px]">
        <ScifiUpload
          {...props}
          onFilesSelected={(files) => {
            log(`INCOMING: ${files.length} file(s)`)
            props.onFilesSelected?.(files)
          }}
          onFileRemove={(id) => {
            log(`PURGED: ${id.slice(0, 8)}`)
            props.onFileRemove?.(id)
          }}
          onError={(error) => {
            log(`ALERT: ${error.message}`)
            props.onError?.(error)
          }}
        />
      </div>
      {events.length > 0 && (
        <div
          className="w-[480px] rounded-lg border p-3 font-mono text-xs"
          style={{
            borderColor: 'oklch(75% 0.15 195 / 0.15)',
            backgroundColor: 'oklch(12% 0.02 260)',
            color: 'oklch(75% 0.15 195 / 0.5)',
          }}
        >
          <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: 'oklch(75% 0.15 195 / 0.3)' }}>
            System Log
          </p>
          {events.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
   PRE-POPULATED WRAPPER
   ============================================================================ */

function PrePopulated({ fileStates, disabled }: { fileStates: ScifiFileState[]; disabled?: boolean }) {
  const [files, setFiles] = useState(fileStates)

  return (
    <div
      className="w-[480px] flex flex-col overflow-hidden rounded-lg border font-mono"
      style={{
        borderColor: 'oklch(75% 0.15 195 / 0.15)',
        backgroundColor: 'oklch(12% 0.02 260)',
      }}
    >
      <ScifiDropZone
        disabled={disabled}
        onFiles={() => {}}
      />
      <div className="flex flex-col">
        {files.map((fs) => (
          <ScifiFileItem
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

/** Default terminal with scanline and floating particles. */
export const Default: Story = {}

/** Drag-over state: neon border shifts cyan → magenta, "INCOMING SIGNAL DETECTED". */
export const DragOver: Story = {
  render: () => (
    <div className="w-[480px]">
      <ScifiDropZone forceDragOver onFiles={() => {}} />
    </div>
  ),
}

/** Files in SCANNING phase (progress 0-30%). */
export const Scanning: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK.data, { status: 'scanning', progress: 12 }),
        createFileState(MOCK.log, { status: 'scanning', progress: 25 }),
      ]}
    />
  ),
}

/** Files in TRANSMITTING phase (progress 30-100%). */
export const Uploading: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK.data, { status: 'uploading', progress: 55 }),
        createFileState(MOCK.image, { status: 'uploading', progress: 78 }),
        createFileState(MOCK.log, { status: 'uploading', progress: 92 }),
      ]}
    />
  ),
}

/** Files VERIFIED — transfer complete. */
export const Verified: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK.data, { status: 'verified', progress: 100 }),
        createFileState(MOCK.key, { status: 'verified', progress: 100 }),
        createFileState(MOCK.log, { status: 'verified', progress: 100 }),
      ]}
    />
  ),
}

/** CORRUPTED files — glitch animation with red displacement. */
export const Corrupted: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK.archive, { status: 'corrupted', error: 'INTEGRITY CHECK FAILED' }),
        createFileState(MOCK.data, { status: 'corrupted', error: 'CONNECTION TERMINATED' }),
      ]}
    />
  ),
}

/** Multiple files in different states. */
export const MultipleFiles: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK.key, { status: 'verified', progress: 100 }),
        createFileState(MOCK.data, { status: 'uploading', progress: 65 }),
        createFileState(MOCK.log, { status: 'scanning', progress: 18 }),
        createFileState(MOCK.archive, { status: 'corrupted', error: 'CHECKSUM MISMATCH' }),
        createFileState(MOCK.image, { status: 'pending' }),
      ]}
    />
  ),
}

/** All statuses for comparison. */
export const AllStates: Story = {
  render: () => (
    <div
      className="w-[480px] flex flex-col overflow-hidden rounded-lg border font-mono"
      style={{
        borderColor: 'oklch(75% 0.15 195 / 0.15)',
        backgroundColor: 'oklch(12% 0.02 260)',
      }}
    >
      <ScifiFileItem fileState={createFileState(MOCK.key, { status: 'pending' })} />
      <ScifiFileItem fileState={createFileState(MOCK.log, { status: 'scanning', progress: 20 })} />
      <ScifiFileItem fileState={createFileState(MOCK.data, { status: 'uploading', progress: 62 })} />
      <ScifiFileItem fileState={createFileState(MOCK.image, { status: 'verified', progress: 100 })} />
      <ScifiFileItem fileState={createFileState(MOCK.archive, { status: 'corrupted', error: 'INTEGRITY FAILURE' })} />
    </div>
  ),
}

/** Fully interactive terminal. */
export const Interactive: Story = {
  render: (args) => <ScifiUploadWithState {...args} />,
}

/** Dark mode — the component IS dark, so this wraps in a light outer for contrast. */
export const DarkMode: Story = {
  parameters: { chromatic: { forcedColors: 'none' } },
  decorators: [
    (Story) => (
      <div className="rounded-lg bg-gray-100 p-8 dark:bg-gray-900">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK.data, { status: 'verified', progress: 100 }),
        createFileState(MOCK.log, { status: 'uploading', progress: 55 }),
        createFileState(MOCK.archive, { status: 'corrupted', error: 'SIGNAL LOST' }),
      ]}
    />
  ),
}

/** Responsive layout. */
export const Responsive: Story = {
  parameters: { chromatic: { viewports: [320, 640, 1024] }, layout: 'fullscreen' },
  render: () => (
    <div className="mx-auto max-w-3xl p-4">
      <ScifiUpload maxFiles={5} />
    </div>
  ),
}

/** Disabled — "SYSTEM OFFLINE". */
export const Disabled: Story = {
  args: { disabled: true },
}

/** Particle intensity control — demonstrates the ambient particle system. */
export const ParticleIntensity: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs text-muted-foreground font-mono">10 particles (subtle)</p>
        <div className="w-[480px]">
          <ScifiDropZone particleCount={10} onFiles={() => {}} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground font-mono">30 particles (dense)</p>
        <div className="w-[480px]">
          <ScifiDropZone particleCount={30} onFiles={() => {}} />
        </div>
      </div>
    </div>
  ),
}

/** All controls exposed. */
export const Playground: Story = {
  args: {
    maxFiles: 10,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
  },
}

/** Interaction test: drag-and-drop. */
export const DragDropTest: Story = {
  args: { maxFiles: 5 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Terminal is visible', async () => {
      const text = canvas.getByText(/upload terminal/i)
      await expect(text).toBeVisible()
    })

    await step('Simulate dropping a file', async () => {
      const dropTarget = canvasElement.querySelector('[role="button"]')!
      const file = new File(['data'], 'neural-net.bin', { type: 'application/octet-stream' })
      const dt = new DataTransfer()
      dt.items.add(file)
      dropTarget.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }))
      dropTarget.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true }))
      dropTarget.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }))
    })

    await step('File appears in terminal', async () => {
      const name = await canvas.findByText('neural-net.bin')
      await expect(name).toBeVisible()
    })
  },
}

/** Accessibility test. */
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
