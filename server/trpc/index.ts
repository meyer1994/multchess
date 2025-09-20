import { TRPCError } from '@trpc/server'
import { Chess } from 'chess.js'
import { asc, desc, eq, sql } from 'drizzle-orm'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod.mjs'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs'
import pRetry from 'p-retry'
import type { MoveEvent } from 'vue3-chessboard'
import { z } from 'zod'
import { TGames, TMoves } from '../db/schema'

const logger = usePino()

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const play = async (model: string, move: MoveEvent) => {
  const openai = new OpenAI()
  const game = new Chess(move.after)

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `
        You are a chess player.

        You will receive the following board state:
        - After: fen string of the board state after the move
        - Before: fen string of the board state before the move
        - Captured: the piece that is captured if any
        - Color: the color of the player to move
        - From: the square the piece is moving from
        - Lan: the language of the move
        - Piece: the piece that is moving
        - Promotion: the promotion piece if any
        - San: the standard algebraic notation of the move
        - To: the square the piece is moving to

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
        After: ${move.after}
        Before: ${move.before}
        Captured: ${move.captured}
        Color: ${move.color}
        From: ${move.from}
        Lan: ${move.lan}
        Piece: ${move.piece}
        To: ${move.to}
        Promotion: ${move.promotion}
        San: ${move.san}

        Possible moves: 
        ${game.moves().join(', ')}
      `,
    },
  ]

  const schema = z.object({ move: z.string() })

  const response = await pRetry(async () => await openai.chat.completions.parse({
    model,
    messages,
    response_format: zodResponseFormat(schema, 'move'),
  }), { retries: 3 })

  const parsed = response.choices[0]?.message?.parsed
  logger.info({ parsed }, 'parsed response')
  if (!parsed) throw new Error('Failed to parse OpenAI response')

  return parsed
}

export const appRouter = createTRPCRouter({
  ping: baseProcedure
    .input(z.literal('ping'))
    .query(() => 'pong'),

  game: createTRPCRouter({
    create: baseProcedure
      .mutation(async () => {
        logger.info('create game')
        const db = useDrizzle()
        const [game] = await db.insert(TGames).values({}).returning()
        if (!game) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
        return game
      }),

    get: baseProcedure
      .input(z.object({ gameId: z.string() }))
      .query(async ({ input }) => {
        logger.info({ input }, 'get game')
        const db = useDrizzle()
        const game = await db.query.TGames.findFirst({
          where: eq(TGames.id, input.gameId),
          with: {
            moves: {
              limit: 1,
              orderBy: [desc(TMoves.index), asc(TMoves.createdAt)],
            },
          },
        })
        if (!game) throw new TRPCError({ code: 'NOT_FOUND' })
        return {
          fenGpt4o: game.moves?.[0]?.moveGpt4oFen || DEFAULT_FEN,
          fenGpt4oMini: game.moves?.[0]?.moveGpt4oMiniFen || DEFAULT_FEN,
        }
      }),

    move: baseProcedure
      .input(z.object({
        gameId: z.string(),
        move: z.record(z.string(), z.any()).transform(p => p as MoveEvent),
      }))
      .mutation(async ({ input }) => {
        logger.info({ input }, 'move')
        const db = useDrizzle()

        const [total] = await db.select({ count: sql<number>`COALESCE(COUNT(*), 0)` })
          .from(TMoves)
          .where(eq(TMoves.gameId, input.gameId))
        if (!total) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })

        logger.info({ total }, 'total moves')

        const [userMove] = await db
          .insert(TMoves)
          .values({
            moveUser: input.move,
            gameId: input.gameId,
            moveGpt4oFen: input.move.after,
            moveGpt4oMiniFen: input.move.after,
            index: total.count,
          })
          .returning()

        logger.info({ userMove }, 'moved')
        if (!userMove) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })

        setImmediate(async () => {
          logger.info('move gpt-4o-mini')
          try {
            const db = useDrizzle()
            const fen = await play('gpt-4o-mini', input.move)
            const chess = new Chess(input.move.after)
            chess.move(fen.move)
            logger.info({ fen: chess.fen() }, 'gpt-4o-mini fen')

            await db.update(TMoves)
              .set({ moveGpt4oMiniFen: chess.fen() })
              .where(eq(TMoves.id, userMove.id))
              .returning()
          }
          catch (error) {
            logger.error({ error }, 'error moving gpt-4o-mini')
          }
        })

        setImmediate(async () => {
          logger.info('move gpt-4o')
          try {
            const db = useDrizzle()
            const fen = await play('gpt-4o', input.move)
            const chess = new Chess(input.move.after)
            chess.move(fen.move)
            logger.info({ fen: chess.fen() }, 'gpt-4o fen')

            await db.update(TMoves)
              .set({ moveGpt4oFen: chess.fen() })
              .where(eq(TMoves.id, userMove.id))
              .returning()
          }
          catch (error) {
            logger.error({ error }, 'error moving gpt-4o')
          }
        })

        return {
          fenGpt4o: userMove.moveGpt4oFen,
          fenGpt4oMini: userMove.moveGpt4oMiniFen,
        }
      }),
  }),
})

export type AppRouter = typeof appRouter
