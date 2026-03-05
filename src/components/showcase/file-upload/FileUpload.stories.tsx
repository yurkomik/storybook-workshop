/* ============================================================================
   FileUpload Stories

   Comprehensive story suite for the FileUpload showcase component.
   Covers all variants, states, interactions, and responsive layouts.

   Sections:
   1. Meta & argTypes
   2. Mock data helpers
   3. State wrapper for interactive stories
   4. Core stories (Default, AllVariants, Interactive, Disabled, etc.)
   5. Pre-populated state stories (Uploading, Error, Complete, etc.)
   6. Variant showcases (Compact, Minimal)
   7. Responsive & Playground
   ============================================================================ */

import { useState, useCallback } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileUpload } from './FileUpload'
import { DropZone } from './DropZone'
import { FileList } from './FileList'
import type { FileUploadProps, FileState, FileUploadError } from './types'

/* ============================================================================
   META
   ============================================================================ */

const meta = {
  title: 'Showcase/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A fully-featured file upload component with drag-and-drop, click-to-browse,
file validation, progress simulation, and three visual variants.

### Features
- **Drag & drop** via native HTML5 drag events
- **Click to browse** via hidden file input
- **Validation**: file type, file size, max count
- **Progress simulation**: fake upload that advances 0 to 100 over ~2s
- **Variants**: \`default\` (full drop zone), \`compact\` (inline), \`minimal\` (button only)
- **Previews**: optional thumbnail previews for image files
- **Accessible**: keyboard navigation, ARIA labels, focus indicators
        `,
      },
    },
  },
  argTypes: {
    /* -- Core -- */
    accept: {
      control: 'object',
      description: 'Accepted file types (extensions or MIME patterns)',
      table: { category: 'Core' },
    },
    maxFiles: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Maximum number of files allowed',
      table: { category: 'Core' },
    },
    maxSizeBytes: {
      control: { type: 'number' },
      description: 'Maximum file size in bytes',
      table: { category: 'Core' },
    },

    /* -- Appearance -- */
    variant: {
      control: 'select',
      options: ['default', 'compact', 'minimal'],
      description: 'Visual variant',
      table: { category: 'Appearance' },
    },
    showPreview: {
      control: 'boolean',
      description: 'Show thumbnail previews for images',
      table: { category: 'Appearance' },
    },

    /* -- State -- */
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
      table: { category: 'State' },
    },

    /* -- Callbacks (hidden from controls) -- */
    onFilesSelected: { table: { disable: true } },
    onFileRemove: { table: { disable: true } },
    onError: { table: { disable: true } },
  },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

/* ============================================================================
   MOCK DATA
   - Realistic file objects for story testing
   - Organized by type and purpose
   ============================================================================ */

function createMockFile(name: string, size: number, type: string): File {
  // Create a file with realistic size by filling an ArrayBuffer
  const buffer = new ArrayBuffer(Math.min(size, 1024))
  return new File([buffer], name, { type, lastModified: Date.now() })
}

const MOCK_FILES = {
  pdf: createMockFile('quarterly-report.pdf', 2_500_000, 'application/pdf'),
  image: createMockFile('hero-banner.png', 1_200_000, 'image/png'),
  csv: createMockFile('contacts-export.csv', 450_000, 'text/csv'),
  doc: createMockFile('proposal-v2.docx', 3_800_000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
  largeFile: createMockFile('raw-footage.mp4', 250_000_000, 'video/mp4'),
  smallImage: createMockFile('avatar.jpg', 85_000, 'image/jpeg'),
  zipFile: createMockFile('project-assets.zip', 15_000_000, 'application/zip'),
}

/** Build a FileState from a mock File with a given status */
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

/* ============================================================================
   STATE WRAPPER
   - Used by Interactive story to show live state debug panel
   ============================================================================ */

function FileUploadWithState(props: Partial<FileUploadProps>) {
  const [files, setFiles] = useState<FileState[]>([])
  const [errors, setErrors] = useState<FileUploadError[]>([])
  const [eventLog, setEventLog] = useState<string[]>([])

  const log = useCallback((msg: string) => {
    setEventLog((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 10))
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-[420px] rounded-lg border border-border bg-background p-4">
        <FileUpload
          maxFiles={5}
          showPreview
          {...props}
          onFilesSelected={(selected) => {
            log(`Selected ${selected.length} file(s): ${selected.map((f) => f.name).join(', ')}`)
            setFiles((prev) => [
              ...prev,
              ...selected.map((f) => createFileState(f, { status: 'uploading', progress: 0 })),
            ])
            props.onFilesSelected?.(selected)
          }}
          onFileRemove={(id) => {
            log(`Removed file: ${id.slice(0, 8)}...`)
            setFiles((prev) => prev.filter((f) => f.id !== id))
            props.onFileRemove?.(id)
          }}
          onError={(error) => {
            log(`Error: ${error.type} - ${error.message}`)
            setErrors((prev) => [error, ...prev].slice(0, 5))
            props.onError?.(error)
          }}
        />
      </div>

      {/* Debug panel */}
      <div className="w-[420px] space-y-2 rounded-md border border-dashed border-border bg-secondary/50 p-3 font-mono text-xs text-foreground/70">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          State
        </p>
        <p>files: {files.length}</p>
        <p>errors: {errors.length}</p>
        {files.length > 0 && (
          <div className="space-y-0.5 border-t border-border/50 pt-1">
            {files.map((f) => (
              <p key={f.id}>
                {f.file.name} ({f.status}, {f.progress}%)
              </p>
            ))}
          </div>
        )}
        {errors.length > 0 && (
          <div className="space-y-0.5 border-t border-border/50 pt-1 text-destructive">
            {errors.map((e, i) => (
              <p key={i}>
                [{e.type}] {e.message}
              </p>
            ))}
          </div>
        )}
        {eventLog.length > 0 && (
          <div className="space-y-0.5 border-t border-border/50 pt-1 text-muted-foreground">
            <p className="text-[10px] uppercase tracking-wider">Event Log</p>
            {eventLog.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================================
   PRE-POPULATED STATE WRAPPER
   - Renders FileList with pre-built FileState entries (no upload simulation)
   - Used for snapshot stories that show specific states
   ============================================================================ */

interface PrePopulatedProps {
  variant?: FileUploadProps['variant']
  fileStates: FileState[]
  disabled?: boolean
}

function PrePopulated({ variant = 'default', fileStates, disabled }: PrePopulatedProps) {
  const [files, setFiles] = useState(fileStates)

  return (
    <div className="w-[420px] space-y-3">
      <DropZone
        variant={variant}
        disabled={disabled}
        onFiles={() => {
          /* no-op for static display */
        }}
      />
      <FileList
        files={files}
        disabled={disabled}
        onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
      />
    </div>
  )
}

/* ============================================================================
   CORE STORIES
   ============================================================================ */

/** Default empty drop zone with no files selected. */
export const Default: Story = {
  args: {},
}

/** All three visual variants displayed side by side for comparison. */
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {(['default', 'compact', 'minimal'] as const).map((v) => (
        <div key={v} className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {v}
          </p>
          <div className="w-[280px]">
            <FileUpload variant={v} maxFiles={3} />
          </div>
        </div>
      ))}
    </div>
  ),
}

/**
 * Fully interactive demo with state debug panel.
 * Drop or click to add files, watch the progress simulation,
 * and see state changes in real time.
 */
export const Interactive: Story = {
  render: () => <FileUploadWithState />,
}

/** Disabled state prevents all interaction. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

/** Explicitly named empty state (same visual as Default). */
export const Empty: Story = {
  args: {
    maxFiles: 5,
    accept: ['.pdf', '.png', '.jpg', 'image/*'],
  },
}

/* ============================================================================
   PRE-POPULATED STATE STORIES
   These render the component with pre-built file states to showcase
   specific UI states without requiring user interaction.
   ============================================================================ */

/** Files currently uploading at various progress levels. */
export const Uploading: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.pdf, {
          status: 'uploading',
          progress: 25,
        }),
        createFileState(MOCK_FILES.image, {
          status: 'uploading',
          progress: 68,
        }),
        createFileState(MOCK_FILES.csv, {
          status: 'uploading',
          progress: 92,
        }),
      ]}
    />
  ),
}

/** Multiple error states: file too large, invalid type, upload failed. */
export const Error: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.largeFile, {
          status: 'error',
          error: 'File exceeds the 10.0 MB limit',
        }),
        createFileState(MOCK_FILES.zipFile, {
          status: 'error',
          error: 'Invalid file type. Accepted: .pdf, .png',
        }),
        createFileState(MOCK_FILES.doc, {
          status: 'error',
          error: 'Upload failed: network timeout',
        }),
      ]}
    />
  ),
}

/** All files uploaded successfully. */
export const UploadComplete: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.pdf, {
          status: 'complete',
          progress: 100,
        }),
        createFileState(MOCK_FILES.image, {
          status: 'complete',
          progress: 100,
        }),
      ]}
    />
  ),
}

/** Pre-populated with selected files in pending state. */
export const FileSelected: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.pdf, { status: 'pending' }),
        createFileState(MOCK_FILES.smallImage, { status: 'pending' }),
      ]}
    />
  ),
}

/** Multiple files in various states to show a realistic mixed scenario. */
export const MultipleFiles: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_FILES.pdf, {
          status: 'complete',
          progress: 100,
        }),
        createFileState(MOCK_FILES.image, {
          status: 'uploading',
          progress: 45,
        }),
        createFileState(MOCK_FILES.csv, {
          status: 'pending',
        }),
        createFileState(MOCK_FILES.doc, {
          status: 'error',
          error: 'Upload failed: server error',
        }),
        createFileState(MOCK_FILES.smallImage, {
          status: 'complete',
          progress: 100,
        }),
      ]}
    />
  ),
}

/* ============================================================================
   DRAG-OVER STATE
   Shows the visual highlight when files are dragged over the zone.
   Uses the forceDragOver prop on DropZone directly.
   ============================================================================ */

/** Visual state when files are being dragged over the drop zone. */
export const DragOver: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Default (drag over)
        </p>
        <div className="w-[300px]">
          <DropZone variant="default" forceDragOver onFiles={() => {}} />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Compact (drag over)
        </p>
        <div className="w-[300px]">
          <DropZone variant="compact" forceDragOver onFiles={() => {}} />
        </div>
      </div>
    </div>
  ),
}

/* ============================================================================
   VARIANT SHOWCASES
   ============================================================================ */

/** Compact variant with multiple files allowed. */
export const Compact: Story = {
  args: {
    variant: 'compact',
    maxFiles: 3,
  },
}

/** Minimal variant: button only, no drop zone. */
export const Minimal: Story = {
  args: {
    variant: 'minimal',
    maxFiles: 1,
  },
}

/* ============================================================================
   DARK MODE
   ============================================================================ */

/** Dark mode rendering for Chromatic visual regression testing. */
export const DarkMode: Story = {
  parameters: {
    chromatic: { forcedColors: 'none' },
  },
  decorators: [
    (Story) => (
      <div className="dark rounded-lg bg-background p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="w-[420px] space-y-6">
      <PrePopulated
        fileStates={[
          createFileState(MOCK_FILES.pdf, {
            status: 'complete',
            progress: 100,
          }),
          createFileState(MOCK_FILES.image, {
            status: 'uploading',
            progress: 55,
          }),
          createFileState(MOCK_FILES.doc, {
            status: 'error',
            error: 'Upload failed: network error',
          }),
        ]}
      />
    </div>
  ),
}

/* ============================================================================
   RESPONSIVE
   ============================================================================ */

/** Responsive layout at three viewport widths for Chromatic snapshot testing. */
export const Responsive: Story = {
  parameters: {
    chromatic: { viewports: [320, 640, 1024] },
    layout: 'fullscreen',
  },
  render: () => (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 p-4 md:grid-cols-3">
      {(['default', 'compact', 'minimal'] as const).map((v) => (
        <div key={v} className="space-y-3">
          <h3 className="text-sm font-medium capitalize text-foreground">{v}</h3>
          <PrePopulated
            variant={v}
            fileStates={[
              createFileState(MOCK_FILES.pdf, {
                status: 'complete',
                progress: 100,
              }),
              createFileState(MOCK_FILES.image, {
                status: 'uploading',
                progress: 60,
              }),
            ]}
          />
        </div>
      ))}
    </div>
  ),
}

/* ============================================================================
   PLAYGROUND
   All controls exposed for free exploration via Storybook controls panel.
   ============================================================================ */

/** Open playground with all controls exposed. Try different combinations. */
export const Playground: Story = {
  args: {
    variant: 'default',
    maxFiles: 5,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
    showPreview: true,
    accept: ['.pdf', '.png', '.jpg', '.csv', 'image/*'],
  },
}
