<script setup lang="ts">
import type { MoveEvent } from 'vue3-chessboard'
import { TheChessboard } from 'vue3-chessboard'

const { $trpc } = useNuxtApp()

const fen = ref('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

const games = reactive({
  fenGpt4o: fen.value,
  fenGpt4oMini: fen.value,
  fenGpt41: fen.value,
  fenGpt41Mini: fen.value,
  fenGpt4Turbo: fen.value,
})

type GameKey = keyof typeof games

const boards: { key: GameKey, label: string }[] = [
  { key: 'fenGpt4o', label: 'GPT-4o' },
  { key: 'fenGpt4oMini', label: 'GPT-4o Mini' },
  { key: 'fenGpt41', label: 'GPT-4.1' },
  { key: 'fenGpt41Mini', label: 'GPT-4.1 Mini' },
  { key: 'fenGpt4Turbo', label: 'GPT-4 Turbo' },
]

const onMove = async (move: MoveEvent) => {
  for (const { key } of boards) games[key] = move.after
  const data = await $trpc.run.query({ fen: move.after })
  for (const { key } of boards) games[key] = data[key]
}
</script>

<template>
  <UApp>
    <UContainer class="flex flex-col gap-4">
      <div class="grid lg:grid-cols-2 gap-4">
        <template
          v-for="board in boards"
          :key="board.key"
        >
          <GameEngine
            v-slot="{ best, depth, score }"
            v-model="games[board.key]"
          >
            <UCard
              :title="board.label"
              :description="games[board.key]"
              :ui="{ body: 'flex items-center justify-center' }"
            >
              <TheChessboard
                class="!size-full"
                :board-config="{ orientation: 'white', fen: games[board.key] }"
                @move="async (e) => await onMove(e)"
              />
            </UCard>
          </GameEngine>
        </template>
      </div>
    </UContainer>
  </UApp>
</template>
