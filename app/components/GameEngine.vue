<script setup lang="ts">
import type { SquareKey } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import { useStockfish } from './engine'

const model = defineModel<string>({ required: true })
const { best, setFen, depth, score } = useStockfish(model.value)
watch(model, p => setFen(p))

type DefaultSlotProps = {
  best: { src: SquareKey, dst: SquareKey } | undefined
  depth: number | undefined
  score: number | undefined
}

defineSlots<{ default: (props: DefaultSlotProps) => VNode }>()
</script>

<template>
  <slot
    :best="best"
    :depth="depth"
    :score="score"
  />
</template>
