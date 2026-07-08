# Multchess

## Stack

- Nuxt 3
- Vue 3 + TypeScript
- vue3-chessboard
- TRPC (`@trpc/server` + Nuxt TRPC plugin)
- LangChain (`@langchain/core`, `@langchain/openai`)
- Chess engine validation with `chess.js`

The API backend is hosted in `server/trpc/index.ts`, and the UI is rendered in
`app/app.vue`.

## TRPC calls

`app/app.vue` issues a TRPC query after each user move:

- `run.query({ fen, model })`
  - `fen`: board state after the move.
  - `model`: one of `gpt-3.5-turbo`, `gpt-4o-mini`, `gpt-4.1-nano`,
    `gpt-4.1-mini`, `o3-mini`, `gpt-5-mini`, `gpt-5-nano`.
  - It returns an object keyed by the selected model:
    `{ [model]: newFen }`.

- `ping` (`baseProcedure`) exists as a basic health query and returns `'pong'`.

## TRPC input validation

- `run` accepts only `fen` (string) and `model` (enum of supported models).
- `fen` is validated as a legal board position using `chess.js` before calling the model.
- Each request is executed through one model per call (single-model payload), which keeps request cost predictable.
- Failures return the original `fen`.

The frontend updates the UI by assigning the returned FEN and advancing all boards.

### How it works

If the `move` query param is present, we present the board with the AI results
for the move. This way, users can share URLs with their moves for a given FEN
and see the AI results for the move.
