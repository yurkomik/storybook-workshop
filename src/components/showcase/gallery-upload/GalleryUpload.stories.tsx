/* ============================================================================
   GalleryUpload Stories

   15 stories for the photo gallery upload component.
   Uses colored SVG data URIs as mock image previews.
   ============================================================================ */

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { GalleryUpload } from './GalleryUpload'
import { GalleryDropZone } from './GalleryDropZone'
import { GalleryGrid } from './GalleryGrid'
import type { GalleryUploadProps, GalleryFileState, GalleryUploadError } from './types'

/* ============================================================================
   META
   ============================================================================ */

const meta = {
  title: 'Showcase/GalleryUpload',
  component: GalleryUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    chromatic: { delay: 300, pauseAnimationAtEnd: true },
    docs: {
      description: {
        component: `
A magazine-quality image gallery upload with large previews, responsive grid layout,
elegant hover overlays, and smooth card entrance animations.

### Design Highlights
- **CSS Grid** with \`auto-fill\` + \`minmax(140px, 1fr)\` for fluid columns
- **Square aspect-ratio** thumbnails for visual consistency
- **Hover overlay** with gradient scrim, file info, and remove button
- **Shimmer placeholder** while images load
- **Card entrance** animation: scale 0.85→1 with ease-out bounce
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
    maxFiles: 12,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
    accept: ['image/*'],
  },
} satisfies Meta<typeof GalleryUpload>

export default meta
type Story = StoryObj<typeof meta>

/* ============================================================================
   MOCK DATA
   ============================================================================ */

/** Generate colored SVG data URIs as mock image previews */
function mockPreviewUrl(color: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="${color}" width="200" height="200"/><text x="100" y="105" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14" font-weight="bold">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(Math.min(size, 1024))
  return new File([buffer], name, { type, lastModified: Date.now() })
}

function createFileState(
  file: File,
  overrides: Partial<Omit<GalleryFileState, 'file'>> = {}
): GalleryFileState {
  return {
    id: crypto.randomUUID(),
    file,
    progress: 0,
    status: 'pending',
    ...overrides,
  }
}

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#34495e']

const MOCK_IMAGES = Array.from({ length: 8 }, (_, i) => ({
  file: createMockFile(`photo-${i + 1}.jpg`, 800_000 + i * 200_000, 'image/jpeg'),
  previewUrl: mockPreviewUrl(COLORS[i], `Photo ${i + 1}`),
}))

const MOCK_FILES = {
  doc: createMockFile('document.pdf', 2_500_000, 'application/pdf'),
  video: createMockFile('clip.mp4', 15_000_000, 'video/mp4'),
}

/* ============================================================================
   STATE WRAPPER
   ============================================================================ */

function GalleryUploadWithState(props: Partial<GalleryUploadProps>) {
  const [events, setEvents] = useState<string[]>([])

  const log = (msg: string) =>
    setEvents((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 10))

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-[520px]">
        <GalleryUpload
          {...props}
          onFilesSelected={(files) => {
            log(`Selected ${files.length} image(s)`)
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
        <div className="w-[520px] rounded-md border border-dashed border-border bg-secondary/50 p-3 font-mono text-xs text-muted-foreground">
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

function PrePopulated({ fileStates, disabled }: { fileStates: GalleryFileState[]; disabled?: boolean }) {
  const [files, setFiles] = useState(fileStates)

  return (
    <div className="w-[520px] space-y-4">
      <GalleryDropZone
        disabled={disabled}
        onFiles={() => {}}
      />
      <GalleryGrid
        files={files}
        disabled={disabled}
        onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
      />
    </div>
  )
}

/* ============================================================================
   STORIES
   ============================================================================ */

/** Default empty state with camera drop zone. */
export const Default: Story = {}

/** Gallery with 6 image previews using colored SVG placeholders. */
export const WithImages: Story = {
  render: () => (
    <PrePopulated
      fileStates={MOCK_IMAGES.slice(0, 6).map(({ file, previewUrl }) =>
        createFileState(file, { status: 'complete', progress: 100, previewUrl })
      )}
    />
  ),
}

/** Single large image preview. */
export const SingleImage: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_IMAGES[0].file, {
          status: 'complete',
          progress: 100,
          previewUrl: MOCK_IMAGES[0].previewUrl,
        }),
      ]}
    />
  ),
}

/** Images at various upload stages. */
export const Uploading: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_IMAGES[0].file, { status: 'uploading', progress: 25, previewUrl: MOCK_IMAGES[0].previewUrl }),
        createFileState(MOCK_IMAGES[1].file, { status: 'uploading', progress: 68, previewUrl: MOCK_IMAGES[1].previewUrl }),
        createFileState(MOCK_IMAGES[2].file, { status: 'uploading', progress: 92, previewUrl: MOCK_IMAGES[2].previewUrl }),
      ]}
    />
  ),
}

/** All uploads complete. */
export const UploadComplete: Story = {
  render: () => (
    <PrePopulated
      fileStates={MOCK_IMAGES.slice(0, 4).map(({ file, previewUrl }) =>
        createFileState(file, { status: 'complete', progress: 100, previewUrl })
      )}
    />
  ),
}

/** Hover over a card to see the overlay with file info and remove button. */
export const HoverPreview: Story = {
  render: () => (
    <div className="w-[520px]">
      <p className="mb-3 text-xs text-muted-foreground">Hover over a card to see the overlay</p>
      <GalleryGrid
        files={MOCK_IMAGES.slice(0, 4).map(({ file, previewUrl }) =>
          createFileState(file, { status: 'complete', progress: 100, previewUrl })
        )}
      />
    </div>
  ),
}

/** Full 8-image grid showing responsive masonry-like layout. */
export const MasonryLayout: Story = {
  render: () => (
    <PrePopulated
      fileStates={MOCK_IMAGES.map(({ file, previewUrl }) =>
        createFileState(file, { status: 'complete', progress: 100, previewUrl })
      )}
    />
  ),
}

/** Empty state with no images. */
export const EmptyState: Story = {
  render: () => (
    <div className="w-[520px]">
      <GalleryDropZone onFiles={() => {}} />
    </div>
  ),
}

/** Fully interactive — drop real images. */
export const Interactive: Story = {
  render: (args) => <GalleryUploadWithState {...args} />,
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
        createFileState(MOCK_IMAGES[0].file, { status: 'complete', progress: 100, previewUrl: MOCK_IMAGES[0].previewUrl }),
        createFileState(MOCK_IMAGES[1].file, { status: 'uploading', progress: 55, previewUrl: MOCK_IMAGES[1].previewUrl }),
        createFileState(MOCK_IMAGES[2].file, { status: 'error', error: 'Upload failed', previewUrl: MOCK_IMAGES[2].previewUrl }),
      ]}
    />
  ),
}

/** Responsive at different viewport widths. */
export const Responsive: Story = {
  parameters: { chromatic: { viewports: [320, 640, 1024] }, layout: 'fullscreen' },
  render: () => (
    <div className="mx-auto max-w-4xl p-4">
      <GalleryGrid
        files={MOCK_IMAGES.map(({ file, previewUrl }) =>
          createFileState(file, { status: 'complete', progress: 100, previewUrl })
        )}
      />
    </div>
  ),
}

/** Mix of images and non-image files (non-images show shimmer placeholder). */
export const MixedMedia: Story = {
  render: () => (
    <PrePopulated
      fileStates={[
        createFileState(MOCK_IMAGES[0].file, { status: 'complete', progress: 100, previewUrl: MOCK_IMAGES[0].previewUrl }),
        createFileState(MOCK_FILES.doc, { status: 'complete', progress: 100 }),
        createFileState(MOCK_IMAGES[1].file, { status: 'uploading', progress: 45, previewUrl: MOCK_IMAGES[1].previewUrl }),
        createFileState(MOCK_FILES.video, { status: 'error', error: 'File too large' }),
      ]}
    />
  ),
}

/** Disabled state. */
export const Disabled: Story = {
  args: { disabled: true },
}

/** All controls exposed for exploration. */
export const Playground: Story = {
  args: {
    maxFiles: 12,
    maxSizeBytes: 10 * 1024 * 1024,
    disabled: false,
    accept: ['image/*'],
  },
}

/** Interaction test: drag-and-drop simulation. */
export const DragDropTest: Story = {
  args: { maxFiles: 6 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Drop zone is visible', async () => {
      const text = canvas.getByText(/add photos|drag.*drop/i)
      await expect(text).toBeVisible()
    })

    await step('Simulate dropping an image', async () => {
      const dropTarget = canvasElement.querySelector('[role="button"]')!
      const file = new File(['img-data'], 'test-photo.jpg', { type: 'image/jpeg' })
      const dt = new DataTransfer()
      dt.items.add(file)
      dropTarget.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }))
      dropTarget.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true }))
      dropTarget.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }))
    })

    await step('Image appears in gallery', async () => {
      const name = await canvas.findByText('test-photo.jpg')
      await expect(name).toBeVisible()
    })
  },
}
