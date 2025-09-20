<script setup lang="ts">
const route = useRoute()
if (!route.params.gid) throw new Error('Game ID is required')

const { $trpc } = useNuxtApp()
const { data, refresh } = $trpc.game.get.useQuery({ gameId: route.params.gid as string })
useIntervalFn(() => refresh(), 1000)

const fenGpt4o = computed(() => data.value?.fenGpt4o)
const fenGpt4oMini = computed(() => data.value?.fenGpt4oMini)
const isProcessing = computed(() => data.value?.isProcessing)
</script>

<template>
  <UApp>
    <UContainer class="p-8">
      <MultiBoard
        :loading="isProcessing"
        :fen-gpt4o="fenGpt4o"
        :fen-gpt4o-mini="fenGpt4oMini"
        @move="async e => {
          await $trpc.game.move.mutate({ gameId: route.params.gid as string, move: e })
          await refresh()
        }"
      />
    </UContainer>
  </UApp>
</template>
