<template>
  <UContainer>
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium">
          New Game
        </h3>
      </template>
      <UButton
        @click="async () => {
          const game = await $trpc.game.create.mutate()
          await navigateTo(`/g/${game.id}`)
        }"
      >
        Create Game
      </UButton>
    </UCard>
  </UContainer>
</template>
