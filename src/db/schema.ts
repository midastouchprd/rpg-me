import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRoleEnum = pgEnum('user_role', [
  'player',
  'quest_giver',
  'admin',
]);

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
// One row per account. "quest_giver" role unlocks their own dashboard later.
// When auth is wired up, this table will be linked to the auth provider's
// user ID (e.g. Clerk externalId or NextAuth user.id).

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  username: varchar('username', { length: 100 }).unique(),
  displayName: varchar('display_name', { length: 255 }),
  role: userRoleEnum('role').notNull().default('player'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// characters
// ---------------------------------------------------------------------------
// One row per inspectable player profile. Current behavior creates one default
// character per signed-in user; future work will add multiple characters and
// public inspect routes by slug.

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerUserId: uuid('owner_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  isPublic: boolean('is_public').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// quests  (active — regular + legendary unified)
// ---------------------------------------------------------------------------
// is_legendary + is_started distinguish the two quest types.
// quest_giver_user_id is nullable: populated once quest givers have accounts,
// otherwise quest_giver_name is the freeform string used today.

export const quests = pgTable('quests', {
  id: uuid('id').primaryKey().defaultRandom(),

  // ownership
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'cascade',
  }),

  // quest giver — freeform name now, linked account later
  questGiverUserId: uuid('quest_giver_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  questGiverName: varchar('quest_giver_name', { length: 255 }).notNull(),
  questGiverTitle: varchar('quest_giver_title', { length: 255 }),

  // quest data
  title: text('title').notNull(),
  goalDays: integer('goal_days').notNull(),
  currentStreak: integer('current_streak').notNull().default(0),
  streakSaveToken: boolean('streak_save_token').notNull().default(true),

  // legendary-specific
  isLegendary: boolean('is_legendary').notNull().default(false),
  isStarted: boolean('is_started').notNull().default(true), // false = locked legendary
  requirement: text('requirement'), // unlock requirement text

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// completed_quests  (archive)
// ---------------------------------------------------------------------------

export const completedQuests = pgTable('completed_quests', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'cascade',
  }),

  // preserve quest giver link if they had an account
  questGiverUserId: uuid('quest_giver_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  questGiverName: varchar('quest_giver_name', { length: 255 }).notNull(),
  questGiverTitle: varchar('quest_giver_title', { length: 255 }),

  title: text('title').notNull(),
  goalDays: integer('goal_days').notNull(),
  isLegendary: boolean('is_legendary').notNull().default(false),

  completedAt: timestamp('completed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  characters: many(characters),
  quests: many(quests),
  completedQuests: many(completedQuests),
  givenQuests: many(quests, { relationName: 'questGiver' }),
  givenCompletedQuests: many(completedQuests, { relationName: 'questGiver' }),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
  owner: one(users, {
    fields: [characters.ownerUserId],
    references: [users.id],
  }),
  quests: many(quests),
  completedQuests: many(completedQuests),
}));

export const questsRelations = relations(quests, ({ one }) => ({
  user: one(users, { fields: [quests.userId], references: [users.id] }),
  character: one(characters, {
    fields: [quests.characterId],
    references: [characters.id],
  }),
  questGiverUser: one(users, {
    fields: [quests.questGiverUserId],
    references: [users.id],
    relationName: 'questGiver',
  }),
}));

export const completedQuestsRelations = relations(
  completedQuests,
  ({ one }) => ({
    user: one(users, {
      fields: [completedQuests.userId],
      references: [users.id],
    }),
    character: one(characters, {
      fields: [completedQuests.characterId],
      references: [characters.id],
    }),
    questGiverUser: one(users, {
      fields: [completedQuests.questGiverUserId],
      references: [users.id],
      relationName: 'questGiver',
    }),
  }),
);
