import type { SquareKey } from 'vue3-chessboard'

const ARRAY = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
const hasWasm = typeof WebAssembly === 'object' && WebAssembly.validate(ARRAY)

export const useStockfish = (fen: Ref<string>) => {
  const { post, data } = useWebWorker(hasWasm ? '/stockfish.wasm.js' : '/stockfish.js')

  watch(fen, (newValue, oldValue) => {
    if (newValue === oldValue) return
    post('uci')
    post('ucinewgame')
    post(`position fen ${fen.value}`)
    post('go depth 10')
  })

  const depth = ref<number>(0)
  const score = ref<number>(-1)
  const bestMove = ref<{ src: SquareKey, dst: SquareKey } | undefined>(undefined)

  watch(data, (data: string) => {
    if (!data) return

    if (data.startsWith('bestmove')) {
      const [, move] = data.split(' ')
      if (!move) return
      const orig = move.slice(0, 2) as SquareKey
      const dest = move.slice(2, 4) as SquareKey
      bestMove.value = { src: orig, dst: dest }
    }

    if (data.startsWith('info')) {
      const value = data.split(' ')[9]
      if (!value) return
      score.value = Number(value)
    }

    if (data.startsWith('info')) {
      const value = data.split(' ')[2]
      if (!value) return
      depth.value = Number(value)
    }
  })

  return { score, bestMove, depth }
}
