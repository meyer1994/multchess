<script setup lang="ts">
import type { MoveEvent, BoardApi } from 'vue3-chessboard'
import { TheChessboard } from 'vue3-chessboard'
import { useStockfish } from './components/engine'

const { $trpc } = useNuxtApp()

const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

type Models
  = | 'fenGpt4o'
    | 'fenGpt4oMini'
    | 'fenGpt41'
    | 'fenGpt41Mini'
    | 'fenGpt4Turbo'

// fen positions for each game (updated by the onMove event)
const fens = reactive<Record<Models, string>>({
  fenGpt4o: FEN,
  fenGpt4oMini: FEN,
  fenGpt41: FEN,
  fenGpt41Mini: FEN,
  fenGpt4Turbo: FEN,
})

// stockfish engines for each game
const stockfish = reactive<Record<Models, ReturnType<typeof useStockfish>>>({
  fenGpt4o: useStockfish(FEN),
  fenGpt4oMini: useStockfish(FEN),
  fenGpt41: useStockfish(FEN),
  fenGpt41Mini: useStockfish(FEN),
  fenGpt4Turbo: useStockfish(FEN),
})

// those are populated by the @board-created event on each game
const boards = reactive<Record<Models, BoardApi | undefined>>({
  fenGpt4o: undefined as BoardApi | undefined,
  fenGpt4oMini: undefined as BoardApi | undefined,
  fenGpt41: undefined as BoardApi | undefined,
  fenGpt41Mini: undefined as BoardApi | undefined,
  fenGpt4Turbo: undefined as BoardApi | undefined,
})

// draw the best move from stockfish to the board
watch(() => stockfish.fenGpt4o.best,
  p => p && boards.fenGpt4o?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish.fenGpt4oMini.best,
  p => p && boards.fenGpt4oMini?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish.fenGpt41.best,
  p => p && boards.fenGpt41?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish.fenGpt41Mini.best,
  p => p && boards.fenGpt41Mini?.drawMove(p.src, p.dst, 'paleGrey'))
watch(() => stockfish.fenGpt4Turbo.best,
  p => p && boards.fenGpt4Turbo?.drawMove(p.src, p.dst, 'paleGrey'))

// move the board to the new position
watch(() => fens.fenGpt4o,
  p => boards.fenGpt4o?.setPosition(p))
watch(() => fens.fenGpt4oMini,
  p => boards.fenGpt4oMini?.setPosition(p))
watch(() => fens.fenGpt41,
  p => boards.fenGpt41?.setPosition(p))
watch(() => fens.fenGpt41Mini,
  p => boards.fenGpt41Mini?.setPosition(p))
watch(() => fens.fenGpt4Turbo, p => boards.fenGpt4Turbo?.setPosition(p))

// for template loop
const games: { key: Models, label: string }[] = [
  { key: 'fenGpt4o', label: 'GPT-4o' },
  { key: 'fenGpt4oMini', label: 'GPT-4o Mini' },
  { key: 'fenGpt41', label: 'GPT-4.1' },
  { key: 'fenGpt41Mini', label: 'GPT-4.1 Mini' },
  { key: 'fenGpt4Turbo', label: 'GPT-4 Turbo' },
]

const onMove = async (move: MoveEvent) => {
  const data = await $trpc.run.query({ fen: move.after })
  Object.assign(fens, data)
}
</script>

<template>
  <UApp>
    <UContainer class="flex flex-col gap-4 p-4">
      <div class="grid lg:grid-cols-2 gap-4">
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
              <h2 class="text-lg font-bold font-mono">
                {{ game.label }}
              </h2>
              <p class="text-xs text-gray-500 font-mono">
                fen: {{ fens[game.key] }}
              </p>
              <p class="text-xs text-gray-500 font-mono">
                s: {{ stockfish[game.key].score }} b: {{ stockfish[game.key].best }}
              </p>
            </template>

            <TheChessboard
              class="!size-full"
              :board-config="{ orientation: 'white', fen: fens[game.key] }"
              @board-created="e => boards[game.key] = e"
              @move="async (e) => await onMove(e)"
            />
          </UCard>
        </template>
      </div>
    </UContainer>
  </UApp>
</template>
