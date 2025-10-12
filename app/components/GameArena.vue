<script setup lang="ts">
import type { MoveEvent } from 'vue3-chessboard'

const props = defineProps<{ fen: string }>()

const { $trpc } = useNuxtApp()

const games = reactive({
  fenGpt4o: props.fen,
  fenGpt4oMini: props.fen,
})

const onMove = async (move: MoveEvent) => {
  games.fenGpt4o = move.after
  games.fenGpt4oMini = move.after
  const data = await $trpc.run.query({ fen: move.after })
  games.fenGpt4o = data.fenGpt4o
  games.fenGpt4oMini = data.fenGpt4oMini
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-2">
            <p>GPT-4o</p>
            <p class="text-xs text-gray-500">
              {{ games.fenGpt4o }}
            </p>
          </div>
        </template>

        <GameBoard
          v-model="games.fenGpt4o"
          @move="onMove"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex flex-col gap-2">
            <p>GPT-4o Mini</p>
            <p class="text-xs text-gray-500">
              {{ games.fenGpt4oMini }}
            </p>
          </div>
        </template>

        <GameBoard
          v-model="games.fenGpt4oMini"
          @move="onMove"
        />
      </UCard>
    </div>
  </div>
</template>
