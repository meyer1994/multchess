<script setup lang="ts">
import type { MoveEvent, BoardApi } from 'vue3-chessboard'
import { TheChessboard } from 'vue3-chessboard'

const { $trpc } = useNuxtApp()

const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

type Models
  = | 'gpt-3.5-turbo'
    | 'gpt-4o-mini'
    | 'gpt-4.1-nano'
    | 'gpt-4.1-mini'
    | 'o3-mini'
    | 'gpt-5-mini'
    | 'gpt-5-nano'

// fen positions for each game (updated by the onMove event)
const fens = reactive<Record<Models, string>>({
  'gpt-3.5-turbo': FEN,
  'gpt-4o-mini': FEN,
  'gpt-4.1-nano': FEN,
  'gpt-4.1-mini': FEN,
  'o3-mini': FEN,
  'gpt-5-mini': FEN,
  'gpt-5-nano': FEN,
})

// stockfish engines for each game
const stockfish = reactive<Record<Models, ReturnType<typeof useStockfish>>>({
  'gpt-3.5-turbo': useStockfish(FEN),
  'gpt-4o-mini': useStockfish(FEN),
  'gpt-4.1-nano': useStockfish(FEN),
  'gpt-4.1-mini': useStockfish(FEN),
  'o3-mini': useStockfish(FEN),
  'gpt-5-nano': useStockfish(FEN),
  'gpt-5-mini': useStockfish(FEN),
})

// those are populated by the @board-created event on each game
const boards = reactive<Record<Models, BoardApi | undefined>>({
  'gpt-3.5-turbo': undefined as BoardApi | undefined,
  'gpt-4o-mini': undefined as BoardApi | undefined,
  'gpt-4.1-nano': undefined as BoardApi | undefined,
  'gpt-4.1-mini': undefined as BoardApi | undefined,
  'o3-mini': undefined as BoardApi | undefined,
  'gpt-5-nano': undefined as BoardApi | undefined,
  'gpt-5-mini': undefined as BoardApi | undefined,
})

const isLoading = reactive<Record<Models, boolean>>({
  'gpt-3.5-turbo': false,
  'gpt-4o-mini': false,
  'gpt-4.1-nano': false,
  'gpt-4.1-mini': false,
  'o3-mini': false,
  'gpt-5-nano': false,
  'gpt-5-mini': false,
})

// draw the best move from stockfish to the board
watch(() => stockfish['gpt-3.5-turbo'].best,
  p => p && boards['gpt-3.5-turbo']?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish['gpt-4o-mini'].best,
  p => p && boards['gpt-4o-mini']?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish['gpt-4.1-nano'].best,
  p => p && boards['gpt-4.1-nano']?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish['gpt-4.1-mini'].best,
  p => p && boards['gpt-4.1-mini']?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish['o3-mini'].best,
  p => p && boards['o3-mini']?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish['gpt-5-nano'].best,
  p => p && boards['gpt-5-nano']?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish['gpt-5-mini'].best,
  p => p && boards['gpt-5-mini']?.drawMove(p.src, p.dst, 'paleGrey'))

// move the board to the new position
watch(() => fens['gpt-3.5-turbo'],
  p => boards['gpt-3.5-turbo']?.setPosition(p))
watch(() => fens['gpt-4o-mini'],
  p => boards['gpt-4o-mini']?.setPosition(p))
watch(() => fens['gpt-4.1-nano'],
  p => boards['gpt-4.1-nano']?.setPosition(p))
watch(() => fens['gpt-4.1-mini'],
  p => boards['gpt-4.1-mini']?.setPosition(p))
watch(() => fens['o3-mini'],
  p => boards['o3-mini']?.setPosition(p))
watch(() => fens['gpt-5-nano'],
  p => boards['gpt-5-nano']?.setPosition(p))
watch(() => fens['gpt-5-mini'],
  p => boards['gpt-5-mini']?.setPosition(p))

// for template loop
const games: { key: Models, label: string }[] = [
  { key: 'gpt-3.5-turbo', label: 'GPT-3.5' },
  { key: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { key: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
  { key: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { key: 'o3-mini', label: 'O3 Mini' },
  { key: 'gpt-5-mini', label: 'GPT-5 mini' },
  { key: 'gpt-5-nano', label: 'GPT-5 nano' },
]

const onMove = async (model: Models, move: MoveEvent) => {
  await Promise.all(Object.keys(fens).map(async (m) => {
    isLoading[m as Models] = true
    const data = await $trpc.run.query({ fen: move.after, model: m as Models })
    isLoading[m as Models] = false
    Object.assign(fens, data)
  }))
}
</script>

<template>
  <UApp>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      <template
        v-for="game in games"
        :key="game.key"
      >
        <UCard
          :ui="{
            body: 'flex items-center justify-center',
            header: 'flex flex-col',
          }"
        >
          <template #header>
            <h2 class="flex items-center justify-between gap-2 text-lg font-bold font-mono">
              {{ game.label }}
              <UBadge
                :color="
                  stockfish[game.key].score > 100 ? 'primary'
                  : stockfish[game.key].score > 20 ? 'secondary'
                    : stockfish[game.key].score > 0 ? 'neutral'
                      : stockfish[game.key].score < -100 ? 'error'
                        : stockfish[game.key].score < -20 ? 'warning'
                          : 'neutral'
                "
                :label="`score: ${stockfish[game.key].score / 100}`"
              />
            </h2>
            <p class="text-xs text-gray-500 font-mono">
              fen: {{ fens[game.key] }}
            </p>
            <p class="text-xs text-gray-500 font-mono">
              best: {{ stockfish[game.key].best }}
            </p>
          </template>

          <TheChessboard
            class="!size-full transition-all"
            :class="[
              { 'opacity-40': isLoading[game.key] },
              { 'animate-pulse': isLoading[game.key] },
              { '![animation-duration:0.7s]': isLoading[game.key] },

            ]"
            :board-config="{ orientation: 'white', fen: fens[game.key] }"
            @board-created="e => boards[game.key] = e"
            @move="async (e) => await onMove(game.key, e)"
          />
        </UCard>
      </template>
    </div>
  </UApp>
</template>
