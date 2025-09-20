import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { MoveEvent } from 'vue3-chessboard'

export const TGames = sqliteTable('games', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
})

export const TMoves = sqliteTable('moves', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  gameId: text('game_id')
    .notNull()
    .references(() => TGames.id, { onDelete: 'cascade' }),

  index: integer('index')
    .notNull(),

  moveUser: text('move_user', { mode: 'json' })
    .$type<MoveEvent>(),
  moveGpt4oMiniFen: text('move_gpt_4o_mini_fen'),
  moveGpt4oFen: text('move_gpt_4o_fen'),

  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
})

export const RGames = relations(TGames, ({ many }) => ({
  moves: many(TMoves),
}))

export const RMoves = relations(TMoves, ({ one }) => ({
  game: one(TGames, {
    fields: [TMoves.gameId],
    references: [TGames.id],
  }),
}))

export type Game = typeof TGames.$inferSelect
export type GameInsert = typeof TGames.$inferInsert
export type Move = typeof TMoves.$inferSelect
export type MoveInsert = typeof TMoves.$inferInsert
