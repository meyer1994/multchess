<script setup lang="ts">
import type { BoardApi, MoveEvent } from 'vue3-chessboard'
import { TheChessboard } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import { useStockfish } from './engine'

type Emits = { (e: 'move', data: MoveEvent): Promise<void> | void }

const emits = defineEmits<Emits>()
const model = defineModel<string>({ required: true })

// vue3-chessboard bureaucracy
let board: BoardApi | undefined
const onCreated = (e: BoardApi) => board = e

const { best, setFen } = useStockfish(model.value)

// add reactivity to the board
watch(model, p => setFen(p))
watch(model, p => board?.setPosition(p))

// add reactivity to stockfish
watch(best, p => p && board?.drawMove(p.src, p.dst, 'paleGrey'))
</script>

<template>
  <TheChessboard
    :board-config="{ orientation: 'white', fen: model }"
    @board-created="e => onCreated(e)"
    @move="e => emits('move', e) || (model = e.after)"
  />
</template>

<style scoped>
@reference "tailwindcss";
.main-wrap { @apply size-72; }
</style>
