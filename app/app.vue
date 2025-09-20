<template>
  <UApp class="h-full">
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center gap-2"
      >
        <UIcon
          name="i-heroicons-squares-2x2"
          class="w-6 h-6"
        />
        <span class="font-bold text-lg">MultiChess</span>
      </NuxtLink>
    </template>

    <UButton
      to="/"
      variant="ghost"
      size="sm"
    >
      Home
    </UButton>
    <UButton
      size="sm"
      @click="async () => {
        const { $trpc } = useNuxtApp()
        const game = await $trpc.game.create.mutate()
        await navigateTo(`/g/${game.id}`)
      }"
    >
      New Game
    </UButton>
    <NuxtPage />
  </UApp>
</template>

<style>
div
  #__nuxt,
  #__layout,
  #__layout > div,
  #app {
    min-height: 100vh;
  }
</style>
