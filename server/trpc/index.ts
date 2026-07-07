import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Chess } from 'chess.js'
import { ChatOpenAI } from '@langchain/openai'
import { createDatabase } from 'db0'
import cloudflareD1 from 'db0/connectors/cloudflare-d1'
import { z } from 'zod'

type PlayOptions = {
  fen: string
  move: string
  orientation: 'white' | 'black'
}

type Model
  = | 'gpt-4o'
    | 'gpt-4o-mini'
    | 'gpt-4.1'
    | 'gpt-4.1-mini'
    | 'gpt-4-turbo'

const db = createDatabase(cloudflareD1({ bindingName: 'DB' }))

const play = async (model: Model, opts: PlayOptions) => {
  console.info({ opts }, 'play')

  const game = new Chess(opts.fen)
  const valid = game.moves()

  const schema = z.object({
    move: z
      .enum(valid as [string, ...string[]])
      .describe(`One of ${valid.join(', ')}`),
  })

  const PROMPT_SYSTEM = `
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
    {{"move": "e4"}}
  `

  const PROMPT_USER = `
    Fen: {fen}
    Your side: black
    Possible moves: {moves}
  `

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', PROMPT_SYSTEM],
    ['human', PROMPT_USER],
  ])

  const llm = new ChatOpenAI({ model })
  const llms = llm.withStructuredOutput(schema)

  const call = async () => {
    const input = { fen: opts.fen, moves: valid.join(', ') }
    const messages = await prompt.invoke(input)
    return await llms.invoke(messages)
  }

  // retry api calls
  const parsed = await call()
  if (!parsed?.move) throw new Error('Failed to get valid move from LangChain')

  game.move(parsed.move)
  return game.fen()
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
            console.error(error)
            return false
          }
        }),
    )
    .query(async ({ input }) => {
      console.info({ input }, 'run')

      const call = (model: Model) => {
        try {
          return play(model, input as PlayOptions)
        }
        catch (e) {
          console.error(e)
          throw e
        }
      }

      const [
        fenGpt4o,
        fenGpt4oMini,
        fenGpt41,
        fenGpt41Mini,
        fenGpt4Turbo,
      ] = await Promise.all([
        call('gpt-4o'),
        call('gpt-4o-mini'),
        call('gpt-4.1'),
        call('gpt-4.1-mini'),
        call('gpt-4-turbo'),
      ])

      return { fenGpt4o, fenGpt4oMini, fenGpt41, fenGpt41Mini, fenGpt4Turbo }
    }),
})

export type AppRouter = typeof appRouter
