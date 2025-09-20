import { useEventBus, type EventBusKey } from '@vueuse/core'
import type { SquareKey } from 'vue3-chessboard'

const ARRAY = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
const hasWasm = typeof WebAssembly === 'object' && WebAssembly.validate(ARRAY)

export const useStockfish = () => {
  const { post, data } = useWebWorker(hasWasm ? '/stockfish.wasm.js' : '/stockfish.js')

  const setPosition = (fen: string) => {
    post('uci')
    post('ucinewgame')
    post('position fen ' + fen)
    post('go depth 10')
  }

  const key: EventBusKey<{ src: SquareKey, dst: SquareKey }> = Symbol('stockfish')
  const bus = useEventBus(key)

  type Function = (src: SquareKey, dst: SquareKey) => Promise<void> | void
  const onBestMove = (cb: Function) => bus.on((e) => {
    cb(e.src, e.dst)
  })

  watch(data, (data) => {
    if (!data) return
    const uci = (data as string).split(' ')
    if (uci[0] === 'bestmove' && uci[1]) {
      const orig = uci[1].slice(0, 2) as SquareKey
      const dest = uci[1].slice(2, 4) as SquareKey
      bus.emit({ src: orig, dst: dest })
    }
  })

  return { setPosition, onBestMove }
}
