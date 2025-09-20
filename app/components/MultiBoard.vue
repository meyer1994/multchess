<script setup lang="ts">
import { TheChessboard, type BoardApi, type BoardConfig, type MoveEvent } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import { useStockfish } from './engine'

const { setPosition: setPositionGpt4o, onBestMove: onBestMoveGpt4o } = useStockfish()
const { setPosition: setPositionGpt4oMini, onBestMove: onBestMoveGpt4oMini } = useStockfish()

let boardGpt4o: BoardApi | undefined = undefined
let boardGpt4oMini: BoardApi | undefined = undefined

const DEFAULT_CONFIG_GPT4O: BoardConfig = {
  orientation: 'white',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
}

const DEFAULT_CONFIG_GPT4O_MINI: BoardConfig = {
  orientation: 'white',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
}

const props = defineProps<{
  fenGpt4o?: string
  fenGpt4oMini?: string
}>()

const onGpt4oCreated = (p: BoardApi) => boardGpt4o = p
const onGpt4oMiniCreated = (p: BoardApi) => boardGpt4oMini = p

const configGpt4o = reactive<BoardConfig>(props.fenGpt4o
  ? { ...DEFAULT_CONFIG_GPT4O, fen: props.fenGpt4o }
  : { ...DEFAULT_CONFIG_GPT4O })
const configGpt4oMini = reactive<BoardConfig>(props.fenGpt4oMini
  ? { ...DEFAULT_CONFIG_GPT4O_MINI, fen: props.fenGpt4oMini }
  : { ...DEFAULT_CONFIG_GPT4O_MINI })

watch(() => props.fenGpt4o, p => configGpt4o.fen = p)
watch(() => props.fenGpt4oMini, p => configGpt4oMini.fen = p)
watch(() => props.fenGpt4o, p => p && boardGpt4o?.setPosition(p))
watch(() => props.fenGpt4oMini, p => p && boardGpt4oMini?.setPosition(p))
watch(() => props.fenGpt4o, p => p && setPositionGpt4o(p))
watch(() => props.fenGpt4oMini, p => p && setPositionGpt4oMini(p))

const emit = defineEmits<{ (e: 'move', data: MoveEvent): Promise<void> }>()

onBestMoveGpt4o((src, dst) => {
  console.log('onBestMoveGpt4o', src, dst)
  boardGpt4o?.drawMove(src, dst, 'paleBlue')
})
onBestMoveGpt4oMini((src, dst) => {
  console.log('onBestMoveGpt4oMini', src, dst)
  boardGpt4oMini?.drawMove(src, dst, 'paleBlue')
})

const onMove = async (e: MoveEvent) => {
  setPositionGpt4o(e.after)
  setPositionGpt4oMini(e.after)
  boardGpt4o?.setPosition(e.after)
  boardGpt4oMini?.setPosition(e.after)
  await emit('move', e)
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <!-- gpt-4o-mini -->
    <UCard variant="soft">
      <template #header>
        <div>
          <h3 class="text-lg font-medium">
            gpt-4o-mini
          </h3>
          <span class="text-sm text-gray-500">
            {{ configGpt4oMini.fen }}
          </span>
        </div>
      </template>
      <ClientOnly>
        <div>
          <TheChessboard
            :board-config="configGpt4oMini"
            reactive-config
            @move="async e => await onMove(e)"
            @board-created="(p) => onGpt4oMiniCreated(p)"
          />
        </div>
      </ClientOnly>
    </UCard>

    <!-- gpt-4o -->
    <UCard variant="soft">
      <template #header>
        <h3 class="text-lg font-mediu m">
          gpt-4o
        </h3>
        <span class="text-sm text-gray-500">
          {{ configGpt4o.fen }}
        </span>
      </template>
      <ClientOnly>
        <div>
          <TheChessboard
            :board-config="configGpt4o"
            reactive-config
            @move="async e => await onMove(e)"
            @board-created="(p) => onGpt4oCreated(p)"
          />
        </div>
      </ClientOnly>
    </UCard>
  </div>
</template>

<style>
@reference "tailwindcss";

.main-wrap {
  @apply size-72;
}
</style>
