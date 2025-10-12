<template>
  <UApp class="h-full">
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
