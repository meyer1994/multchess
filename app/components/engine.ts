import type { SquareKey } from 'vue3-chessboard'

const ARRAY = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
const hasWasm = typeof WebAssembly === 'object' && WebAssembly.validate(ARRAY)

export const useStockfish = (fen: string) => {
  const { post, data } = useWebWorker(hasWasm ? '/stockfish.wasm.js' : '/stockfish.js')

  const depth = ref<number>(0)
  const score = ref<number>(-1)
  const best = ref<{ src: SquareKey, dst: SquareKey } | undefined>(undefined)

  const setFen = (fen: string) => {
    post('uci')
    post('ucinewgame')
    post(`position fen ${fen}`)
    post('go depth 10')
  }

  watch(data, (data: string) => {
    if (!data) return

    if (data.startsWith('bestmove')) {
      const [, move] = data.split(' ')
      if (!move) return
      const orig = move.slice(0, 2) as SquareKey
      const dest = move.slice(2, 4) as SquareKey
      best.value = { src: orig, dst: dest }
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

  setFen(fen)

  return { score, best, depth, setFen }
}
