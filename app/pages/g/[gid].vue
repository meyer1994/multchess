<script setup lang="ts">
import 'vue3-chessboard/style.css'

const route = useRoute()
if (!route.params.gid) throw new Error('Game ID is required')

const { $trpc } = useNuxtApp()
const { data, refresh } = $trpc.game.get.useQuery({ gameId: route.params.gid as string })
</script>

<template>
  <UApp>
    <UContainer class="p-8">
      <pre>{{ data?.fenGpt4o }}</pre>
      <pre>{{ data?.fenGpt4oMini }}</pre>
      <MultiBoard
        @move="async e => {
          await $trpc.game.move.mutate({ gameId: route.params.gid as string, move: e })
          await refresh()
        }"
      />
    </UContainer>
  </UApp>
</template>

<style>
@reference "tailwindcss";

.main-wrap {
  @apply size-72;
}
</style>
