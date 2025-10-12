# Nuxt Minimal Starter


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
