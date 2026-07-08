# Multchess

## Stack

- Nuxt 4
- Vue 3 + TypeScript
- vue3-chessboard
- TRPC (`@trpc/server` + Nuxt TRPC plugin)
- LangChain (`@langchain/core`, `@langchain/openai`)
- Chess engine validation with `chess.js`

The API backend is hosted in `server/trpc/index.ts`, and the UI is rendered in
`app/app.vue`.

## TRPC calls

### Example (Nuxt 4)

```ts
const { $trpc } = useNuxtApp()
console.log(await $trpc.run.query({ fen:  'rnbqkbnr...', model: 'gpt-5-mini'})
// { 'gpt-5-mini': 'rnbqkbnr...' }
```

### How it works

If the `move` query param is present, we present the board with the AI results
for the move. This way, users can share URLs with their moves for a given FEN
and see the AI results for the move.
