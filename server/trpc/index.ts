import { Chess } from 'chess.js'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod.mjs'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs'
import pRetry from 'p-retry'
import { z } from 'zod'

const logger = usePino()

type PlayOptions = {
  fen: string
  move: string
  orientation: 'white' | 'black'
}

const play = async (model: string, opts: PlayOptions) => {
  logger.info({ opts }, 'play')
  const openai = new OpenAI()

  const game = new Chess(opts.fen)

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `
        You are a chess player.

        You will receive the following board state:
        - Fen: fen string of the board state
        - Moves: list of possible moves
        - Orientation: your side (white or black)

        You need to return the best move for the given board state.

        Output:
        - Move: the move to make (in SAN notation)
        - JSON format

        Example:
        {"move": "e4"}
      `,
    },
    {
      role: 'user',
      content: `
        Fen: ${opts.fen}
        Your side: black
        Possible moves: ${game.moves().join(', ')}
      `,
    },
  ]

  const schema = z.object({
    move: z
      .string()
      .describe(`One of ${game.moves().join(', ')}`),
  })

  const doFetch = async () => await openai.chat.completions.parse({
    model,
    messages,
    response_format: zodResponseFormat(schema, 'move'),
  })

  // we try 3 times to get a valid move
  for (let i = 0; i < 3; i++) {
    // rety api calls
    const response = await pRetry(doFetch, { retries: 3 })

    // skip if no message
    const message = response.choices[0]?.message
    if (!message) continue

    // skip if no parsed
    const parsed = message.parsed
    if (!parsed) continue

    messages.push(message)

    try {
      game.move(parsed.move)
      return game.fen()
    }
    catch (error) {
      logger.error(error)
      messages.push({ role: 'user', content: String(error) })
    }
  }

  throw new Error('Failed to parse OpenAI response')
}

export const appRouter = createTRPCRouter({
  ping: baseProcedure
    .input(z.literal('ping'))
    .query(() => 'pong'),

  run: baseProcedure
    .input(
      z
        .object({
          fen: z.string(),
          // move: z.string().optional(),
          // orientation: z.enum(['white', 'black']).default('white'),
        })
        .refine((p) => {
          try {
            new Chess(p.fen) // validate fen
            return true
            // by deafult we return an empty list when no move is provided this
            // makes logic a lot simpler in the UI as we don't have to check if
            // the move is undefined and other shenanigans
            // if (!p.move) return true
            // return game.moves().includes(p.move) // validate move
          }
          catch (error) {
            logger.error(error)
            return false
          }
        }),
    )
    .query(async ({ input }) => {
      logger.info({ input }, 'run')

      const [fenGpt4o, fenGpt4oMini] = await Promise.all([
        play('gpt-4o', input as PlayOptions),
        play('gpt-4o-mini', input as PlayOptions),
      ])

      return { fenGpt4o, fenGpt4oMini }
    }),
})

export type AppRouter = typeof appRouter
