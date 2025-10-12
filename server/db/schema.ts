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

export const TBoards = sqliteTable('boards', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  gameId: text('game_id')
    .notNull()
    .references(() => TGames.id, { onDelete: 'cascade' }),

  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
})

export const RGames = relations(TGames, ({ many }) => ({
  moves: many(TBoards),
}))

export const RMoves = relations(TBoards, ({ one }) => ({
  game: one(TGames, {
    fields: [TBoards.gameId],
    references: [TGames.id],
  }),
}))

export type Game = typeof TGames.$inferSelect
export type GameInsert = typeof TGames.$inferInsert
export type Move = typeof TBoards.$inferSelect
export type MoveInsert = typeof TBoards.$inferInsert
