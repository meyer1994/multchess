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

## Query params

The whole state of the app is defined by the query params. They currently are:

- `fen` (optional) - the FEN string of the board. Defaults to
  `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
- `orientation` (optional) - the orientation of the board (`white` or `black`).
  Defaults to `white`
- `move` (optional) - the move made by the user. So we can present the board
  with the AI results for the move.

Examples:

- `?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
- `?fen=rnbqkb1r/pppppppp/5n2/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 1 2&move=Nf3`
- `?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&orientation=black`
- `?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&move=e4&orientation=white`
- `?fen=r1bqkbnr/pppp1ppp/2n5/4p3/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 4 4&move=h6&orientation=black`
- `?move=d4`
- `?move=e4&orientation=black`

### How it works

If the `move` query param is present, we present the board with the AI results
for the move. This way, users can share URLs with their moves for a given FEN
and see the AI results for the move.
