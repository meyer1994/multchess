<script setup lang="ts">
import type { BoardApi, MoveEvent, SquareKey } from 'vue3-chessboard'
import type { CardProps } from '@nuxt/ui'
import { TheChessboard } from 'vue3-chessboard'
import { useStockfish } from './engine'

const props = defineProps<{ fen: string } & CardProps>()
const stockfish = useStockfish(props.fen)
const board = ref<BoardApi | null>(null)

const emits = defineEmits<{ (e: 'move', event: MoveEvent): void }>()

// draw the best move from stockfish to the board
watch(stockfish.best, p => p && board.value?.drawMove(p.src, p.dst, 'paleGrey'))

// move the board to the new position on prop change
watch(() => props.fen, p => board.value?.setPosition(p))

// watch the props to update stockfish
watch(() => props.fen, p => stockfish.setFen(p))

interface SlotProps {
  // structural (public) shape of BoardApi: matches the value Vue exposes after
  // unwrapping the ref in the template, which drops BoardApi's private members
  board: { [K in keyof BoardApi]: BoardApi[K] } | null
  stockfish: { score: number, best: { src: SquareKey, dst: SquareKey } | undefined }
  fen: string
}

defineSlots<{
  header: (props: SlotProps) => unknown
  default: (props: SlotProps) => unknown
  footer: (props: SlotProps) => unknown
}>()
</script>

<template>
  <UCard v-bind="props">
    <template #header>
      <slot
        name="header"
        :board="board"
        :stockfish="{ score: stockfish.score.value, best: stockfish.best.value }"
        :fen="props.fen"
      />
    </template>

    <slot
      name="default"
      :board="board"
      :stockfish="{ score: stockfish.score.value, best: stockfish.best.value }"
      :fen="props.fen"
    >
      <TheChessboard
        class="!size-full"
        :board-config="{ orientation: 'white', fen: props.fen }"
        @board-created="(e: BoardApi) => board = e"
        @move="(event: MoveEvent) => emits('move', event)"
      />
    </slot>

    <template #footer>
      <slot
        name="footer"
        :board="board"
        :stockfish="{ score: stockfish.score.value, best: stockfish.best.value }"
        :fen="props.fen"
      />
    </template>
  </UCard>
</template>
