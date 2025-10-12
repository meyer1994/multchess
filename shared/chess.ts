import { Chess } from 'chess.js'
import type { MoveEvent } from 'vue3-chessboard'

export const validMoves = (fen: string) => {
  const chess = new Chess(fen)
  return chess.moves()
}

export const isValidMove = (fen: string, move: MoveEvent) => {
  const chess = new Chess(fen)
  return chess.move(move.san, { strict: false })
}
