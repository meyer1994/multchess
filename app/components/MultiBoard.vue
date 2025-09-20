<script setup lang="ts">
import { TheChessboard, type BoardApi, type BoardConfig, type MoveEvent } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'

const STATE = {
  orientation: 'white',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
} as const

let boardGpt4o: BoardApi | null = null
let boardGpt4oMini: BoardApi | null = null
const onGpt4oCreated = (p: BoardApi) => boardGpt4o = p
const onGpt4oMiniCreated = (p: BoardApi) => boardGpt4oMini = p

const configGpt4o = reactive<BoardConfig>(STATE)
const configGpt4oMini = reactive<BoardConfig>(STATE)

const emit = defineEmits<{ (e: 'move', data: MoveEvent): Promise<void> }>()

const onMove = async (e: MoveEvent) => {
  if (boardGpt4o) boardGpt4o.setPosition(e.after)
  if (boardGpt4oMini) boardGpt4oMini.setPosition(e.after)
  await emit('move', e)
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <!-- gpt-4o-mini -->
    <UCard variant="soft">
      <template #header>
        <h3 class="text-lg font-medium">
          gpt-4o-mini
        </h3>
        <pre>{{ configGpt4oMini.fen }}</pre>
      </template>
      <ClientOnly>
        <div>
          <TheChessboard
            :board-config="configGpt4oMini"
            reactive-config
            @move="async e => await onMove(e)"
            @board-created="(p) => onGpt4oMiniCreated(p)"
          />
        </div>
      </ClientOnly>
    </UCard>

    <!-- gpt-4o -->
    <UCard variant="soft">
      <template #header>
        <h3 class="text-lg font-mediu m">
          gpt-4o
        </h3>
        <pre>{{ configGpt4o.fen }}</pre>
      </template>
      <ClientOnly>
        <div>
          <TheChessboard
            :board-config="configGpt4o"
            reactive-config
            @move="async e => await onMove(e)"
            @board-created="(p) => onGpt4oCreated(p)"
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
