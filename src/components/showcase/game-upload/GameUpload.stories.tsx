/* ============================================================================
   GameUpload Stories

   16 stories for the retro arcade / gamified upload component.
   ============================================================================ */

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { GameUpload } from './GameUpload'
import { GameDropZone } from './GameDropZone'
import { GameHUD } from './GameHUD'
import { GameFileItem } from './GameFileItem'
import type { GameUploadProps, GameFileState, LootRarity as LootRarityType } from './types'

/* ============================================================================
   META
   ============================================================================ */

const meta = {
  title: 'Showcase/GameUpload',
  component: GameUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    chromatic: { delay: 300, pauseAnimationAtEnd: true },
    docs: {
      description: {
        component: `
A retro arcade / gamified file upload with XP bars, combo counters,
loot rarity system, and achievement banners. Monospace font throughout.

### Game Mechanics
- **XP System**: Files earn XP based on rarity. 500 XP per level.
- **Rarity**: Determined by file size — common (<100KB) to legendary (>10MB)
- **Combos**: Drop 2+ files simultaneously for combo multiplier display
- **Achievements**: Unlock banners for milestones (first upload, 5 streak, etc.)
- **Sound Events**: \`onSoundEvent\` callback for audio integration
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
    onSoundEvent: { table: { disable: true } },
  },
  args: {
    maxFiles: 10,
    maxSizeBytes: 50 * 1024 * 1024,
    disabled: false,
  },
} satisfies Meta<typeof GameUpload>

export default meta
type Story = StoryObj<typeof meta>

/* ============================================================================
   MOCK DATA
   ============================================================================ */

function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(Math.min(size, 1024))
  return new File([buffer], name, { type, lastModified: Date.now() })
}

function createGameFileState(
  file: File,
  rarity: LootRarityType,
  overrides: Partial<Omit<GameFileState, 'file' | 'rarity'>> = {}
): GameFileState {
  const xpValues: Record<LootRarityType, number> = {
    common: 25, uncommon: 50, rare: 100, epic: 200, legendary: 500,
  }
  return {
    id: crypto.randomUUID(),
    file,
    progress: 0,
    status: 'pending',
    rarity,
    xpValue: xpValues[rarity],
    ...overrides,
  }
}

const MOCK = {
  tiny: createMockFile('readme.txt', 50_000, 'text/plain'),
  small: createMockFile('icon.png', 200_000, 'image/png'),
  medium: createMockFile('report.pdf', 1_500_000, 'application/pdf'),
  large: createMockFile('design-system.fig', 8_000_000, 'application/octet-stream'),
  huge: createMockFile('raw-footage.mp4', 25_000_000, 'video/mp4'),
}

/* ============================================================================
   STATE WRAPPER
   ============================================================================ */

function GameUploadWithState(props: Partial<GameUploadProps>) {
  const [soundEvents, setSoundEvents] = useState<string[]>([])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[440px]">
        <GameUpload
          {...props}
          onSoundEvent={(event) => {
            setSoundEvents((prev) => [`${new Date().toLocaleTimeString()} ${event}`, ...prev].slice(0, 10))
            props.onSoundEvent?.(event)
          }}
        />
      </div>
      {soundEvents.length > 0 && (
        <div className="w-[440px] rounded-none border border-green-400/20 bg-black/90 p-3 font-mono text-xs text-green-400/60">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-green-400/40">Sound Events</p>
          {soundEvents.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
   STORIES
   ============================================================================ */

/** Default state — empty mission zone with HUD. */
export const Default: Story = {}

/** Drag-over state with flashing border and "INCOMING!" text. */
export const DragOver: Story = {
  render: () => (
    <div className="w-[440px]">
      <GameDropZone forceDragOver onFiles={() => {}} />
    </div>
  ),
}

/** Level 1 with some XP accumulated. */
export const Level1: Story = {
  render: () => (
    <div className="w-[440px] space-y-0 overflow-hidden rounded-lg border-2 border-green-400/20 bg-black/95">
      <GameHUD level={1} xp={175} xpToNextLevel={500} combo={0} totalFiles={3} />
      <div className="flex flex-col">
        <GameFileItem fileState={createGameFileState(MOCK.tiny, 'common', { status: 'complete', progress: 100 })} />
        <GameFileItem fileState={createGameFileState(MOCK.small, 'uncommon', { status: 'complete', progress: 100 })} />
        <GameFileItem fileState={createGameFileState(MOCK.medium, 'rare', { status: 'uploading', progress: 55 })} />
      </div>
    </div>
  ),
}

/** Level 3 with high XP and multiple completed files. */
export const Level3WithXP: Story = {
  render: () => (
    <div className="w-[440px] space-y-0 overflow-hidden rounded-lg border-2 border-green-400/20 bg-black/95">
      <GameHUD level={3} xp={420} xpToNextLevel={500} combo={0} totalFiles={7} />
      <div className="flex flex-col">
        <GameFileItem fileState={createGameFileState(MOCK.huge, 'legendary', { status: 'complete', progress: 100 })} />
        <GameFileItem fileState={createGameFileState(MOCK.large, 'epic', { status: 'complete', progress: 100 })} />
        <GameFileItem fileState={createGameFileState(MOCK.medium, 'rare', { status: 'complete', progress: 100 })} />
      </div>
    </div>
  ),
}

/** Active combo multiplier display. */
export const ComboMultiplier: Story = {
  render: () => (
    <div className="w-[440px] space-y-0 overflow-hidden rounded-lg border-2 border-green-400/20 bg-black/95">
      <GameHUD level={2} xp={250} xpToNextLevel={500} combo={3} totalFiles={5} />
      <div className="flex flex-col">
        <GameFileItem fileState={createGameFileState(MOCK.small, 'uncommon', { status: 'uploading', progress: 30 })} />
        <GameFileItem fileState={createGameFileState(MOCK.medium, 'rare', { status: 'uploading', progress: 15 })} />
        <GameFileItem fileState={createGameFileState(MOCK.tiny, 'common', { status: 'uploading', progress: 45 })} />
      </div>
    </div>
  ),
}

/** Achievement banner example. */
export const AchievementUnlocked: Story = {
  render: () => (
    <div className="relative w-[440px]">
      <div className="space-y-0 overflow-hidden rounded-lg border-2 border-green-400/20 bg-black/95">
        <GameHUD level={1} xp={25} xpToNextLevel={500} combo={0} totalFiles={1} />
        <GameFileItem fileState={createGameFileState(MOCK.tiny, 'common', { status: 'complete', progress: 100 })} />
      </div>
      {/* Static achievement banner for snapshot */}
      <div className="mt-4 flex items-center gap-3 rounded-none border-2 border-yellow-400 bg-black/95 px-4 py-3 font-mono shadow-lg">
        <span className="text-lg font-bold text-yellow-400">{'>'}</span>
        <div>
          <p className="text-sm font-bold text-yellow-400">FIRST UPLOAD!</p>
          <p className="text-[10px] text-yellow-400/60">Deploy your first file</p>
        </div>
      </div>
    </div>
  ),
}

/** All 5 rarity tiers displayed side by side. */
export const LootRarity: Story = {
  render: () => (
    <div className="w-[440px] flex flex-col bg-black/95">
      {(
        [
          { file: MOCK.tiny, rarity: 'common' as const },
          { file: MOCK.small, rarity: 'uncommon' as const },
          { file: MOCK.medium, rarity: 'rare' as const },
          { file: MOCK.large, rarity: 'epic' as const },
          { file: MOCK.huge, rarity: 'legendary' as const },
        ] as const
      ).map(({ file, rarity }) => (
        <GameFileItem
          key={rarity}
          fileState={createGameFileState(file, rarity, { status: 'complete', progress: 100 })}
        />
      ))}
    </div>
  ),
}

/** Error state. */
export const ErrorState: Story = {
  render: () => (
    <div className="w-[440px] space-y-0 overflow-hidden rounded-lg border-2 border-green-400/20 bg-black/95">
      <GameHUD level={1} xp={75} xpToNextLevel={500} combo={0} totalFiles={3} />
      <div className="flex flex-col">
        <GameFileItem fileState={createGameFileState(MOCK.tiny, 'common', { status: 'complete', progress: 100 })} />
        <GameFileItem fileState={createGameFileState(MOCK.huge, 'legendary', { status: 'error', error: 'MISSION FAILED: file too heavy' })} />
        <GameFileItem fileState={createGameFileState(MOCK.medium, 'rare', { status: 'error', error: 'NETWORK ERROR: connection lost' })} />
      </div>
    </div>
  ),
}

/** All file states for comparison. */
export const AllStates: Story = {
  render: () => (
    <div className="w-[440px] flex flex-col bg-black/95">
      <GameFileItem fileState={createGameFileState(MOCK.tiny, 'common', { status: 'pending' })} />
      <GameFileItem fileState={createGameFileState(MOCK.small, 'uncommon', { status: 'uploading', progress: 42 })} />
      <GameFileItem fileState={createGameFileState(MOCK.medium, 'rare', { status: 'complete', progress: 100 })} />
      <GameFileItem fileState={createGameFileState(MOCK.large, 'epic', { status: 'error', error: 'UPLOAD FAILED' })} />
    </div>
  ),
}

/** Fully interactive — drop files and watch the game unfold. */
export const Interactive: Story = {
  render: (args) => <GameUploadWithState {...args} />,
}

/** Dark mode (component is already dark, this adds dark class context). */
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
    <div className="w-[440px] space-y-0 overflow-hidden rounded-lg border-2 border-green-400/20 bg-black/95">
      <GameHUD level={2} xp={300} xpToNextLevel={500} combo={0} totalFiles={4} />
      <div className="flex flex-col">
        <GameFileItem fileState={createGameFileState(MOCK.medium, 'rare', { status: 'complete', progress: 100 })} />
        <GameFileItem fileState={createGameFileState(MOCK.small, 'uncommon', { status: 'uploading', progress: 70 })} />
      </div>
    </div>
  ),
}

/** Responsive layout. */
export const Responsive: Story = {
  parameters: { chromatic: { viewports: [320, 640, 1024] }, layout: 'fullscreen' },
  render: () => (
    <div className="mx-auto max-w-3xl p-4">
      <GameUpload maxFiles={5} />
    </div>
  ),
}

/** Disabled state — grayed out mission zone. */
export const Disabled: Story = {
  args: { disabled: true },
}

/** Sound events callback demo. */
export const SoundEvents: Story = {
  render: (args) => <GameUploadWithState {...args} />,
}

/** All controls exposed for exploration. */
export const Playground: Story = {
  args: {
    maxFiles: 10,
    maxSizeBytes: 50 * 1024 * 1024,
    disabled: false,
  },
}

/** Interaction test: drag-and-drop. */
export const DragDropTest: Story = {
  args: { maxFiles: 5 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Mission zone is visible', async () => {
      const text = canvas.getByText(/mission zone/i)
      await expect(text).toBeVisible()
    })

    await step('Simulate dropping a file', async () => {
      const dropTarget = canvasElement.querySelector('[role="button"]')!
      const file = new File(['data'], 'loot-item.pdf', { type: 'application/pdf' })
      const dt = new DataTransfer()
      dt.items.add(file)
      dropTarget.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }))
      dropTarget.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true }))
      dropTarget.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }))
    })

    await step('File appears as loot item', async () => {
      const name = await canvas.findByText('loot-item.pdf')
      await expect(name).toBeVisible()
    })
  },
}
