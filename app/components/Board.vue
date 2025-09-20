<script setup lang="ts">
import { TheChessboard, type BoardApi, type BoardConfig, type MoveEvent } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import { useStockfish } from './engine'

let board: BoardApi | undefined = undefined
const { setPosition, onBestMove } = useStockfish()
const emit = defineEmits<{ (e: 'move', data: MoveEvent): Promise<void> | void }>()

const props = defineProps<{ fen: string }>()
const config = reactive<BoardConfig>({
  fen: props.fen,
  orientation: 'white',
})

watch(() => props.fen, p => config.fen = p)

onBestMove((src, dst) => {
  console.log('onBestMove', src, dst)
  board?.drawMove(src, dst, 'paleBlue')
})

const onMove = async (e: MoveEvent) => {
  setPosition(e.after)
  board?.setPosition(e.after)
  await emit('move', e)
}

const onBoardCreated = (p: BoardApi) => {
  board = p
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <UCard variant="soft">
      <ClientOnly>
        <div>
          <TheChessboard
            :board-config="config"
            reactive-config
            @move="async e => await onMove(e)"
            @board-created="(p) => onBoardCreated(p)"
          />
        </div>
      </ClientOnly>
    </UCard>
  </div>
</template>

<style>
@reference "tailwindcss";

.main-wrap {
  @apply size-72;
}
</style>
