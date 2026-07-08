<script setup lang="ts">
const { $trpc } = useNuxtApp()

useHead({
  htmlAttrs: { lang: 'en' },
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#0f172a' },
    { name: 'twitter:creator', content: '@multchess' },
  ],
})

useSeoMeta({
  title: import.meta.dev ? 'LOCAL Multchess' : 'Multchess',
  description: 'Compare move suggestions from multiple OpenAI models live in an interactive chess board using Nuxt and TRPC.',
  ogTitle: 'Multchess - LLM chess analysis in your browser',
  ogDescription: 'Compare move suggestions from multiple OpenAI models live in an interactive chess board using Nuxt and TRPC.',
  ogType: 'website',
  ogSiteName: 'Multchess',
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Multchess - LLM chess analysis in your browser',
  twitterDescription: 'Compare move suggestions from multiple OpenAI models live in an interactive chess board using Nuxt and TRPC.',
  keywords: 'chess, LLM, OpenAI, AI chess, GPT, Nuxt, TRPC, vue',
})

const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

type Models
  = | 'gpt-3.5-turbo'
    | 'gpt-4o-mini'
    | 'gpt-4.1-nano'
    | 'gpt-4.1-mini'
    | 'o3-mini'
    | 'gpt-5-mini'
    | 'gpt-5-nano'

interface Board {
  fen: string
  model: Models
  isloading: boolean
}

const boards = reactive<Board[]>([
  { fen: FEN, model: 'gpt-3.5-turbo', isloading: false },
  { fen: FEN, model: 'gpt-4.1-mini', isloading: false },
  { fen: FEN, model: 'gpt-4.1-nano', isloading: false },
  { fen: FEN, model: 'gpt-4o-mini', isloading: false },
  { fen: FEN, model: 'gpt-5-mini', isloading: false },
  { fen: FEN, model: 'gpt-5-nano', isloading: false },
  { fen: FEN, model: 'o3-mini', isloading: false },
])

const handleMove = async (fen: string) => Promise.all(boards.map(async (b) => {
  b.isloading = true
  const result = await $trpc.run.query({ model: b.model, fen: fen })
  b.fen = result.fen
  b.isloading = false
})).catch(e => console.error(e))
</script>

<template>
  <UApp>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      <GameBoard
        v-for="board in boards"
        :key="board.model"
        :fen="board.fen"
        :ui="{
          header: 'flex flex-col gap-1',
          body: [
            board.isloading ? 'animate-pulse' : '',
            board.isloading ? 'pointer-events-none' : '',
          ],
        }"
        @move="event => handleMove(event.after)"
      >
        <template #header="{ stockfish, fen }">
          <!-- first row -->
          <h2 class="text-lg font-bold font-mono">
            {{ board.model }}
          </h2>

          <span
            class="font-mono text-xs text-muted truncate"
            :title="String(stockfish.best)"
          >
            {{ { best: stockfish.best } }}
          </span>

          <span
            class="font-mono text-xs text-muted truncate"
            :title="fen"
          >
            {{ { fen: board.fen } }}
          </span>

          <UProgress
            :class="{ invisible: !board.isloading }"
            size="sm"
          />
        </template>
      </GameBoard>
    </div>
  </UApp>
</template>
