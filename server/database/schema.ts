import { sql } from 'drizzle-orm'
import {
  mysqlTable, int, varchar, text, datetime, mysqlEnum, unique, check
} from 'drizzle-orm/mysql-core'

export const podnik = mysqlTable('podnik', {
  id: int('id').primaryKey().autoincrement(),
  nazev: varchar('nazev', { length: 150 }).notNull(),
  adresa: varchar('adresa', { length: 255 }).notNull(),
})

export const zarizeni = mysqlTable('zarizeni', {
  id: int('id').primaryKey().autoincrement(),
  podnikId: int('podnik_id').notNull()
    .references(() => podnik.id, { onDelete: 'cascade' }),
  nazev: varchar('nazev', { length: 150 }).notNull(),
  popis: text('popis'),
})

export const akce = mysqlTable('akce', {
  id: int('id').primaryKey().autoincrement(),
  podnikId: int('podnik_id').notNull()
    .references(() => podnik.id, { onDelete: 'cascade' }),
  nazev: varchar('nazev', { length: 150 }).notNull(),
  datum: datetime('datum').notNull(),
  popis: text('popis'),
})

export const stul = mysqlTable('stul', {
  id: int('id').primaryKey().autoincrement(),
  podnikId: int('podnik_id').notNull()
    .references(() => podnik.id, { onDelete: 'cascade' }),
  cislo: int('cislo').notNull(),
  kapacita: int('kapacita').notNull(),
  posX: int('pos_x').notNull(),
  posY: int('pos_y').notNull(),
}, (t) => [
  unique().on(t.podnikId, t.cislo),
  check('kapacita_kladna', sql`${t.kapacita} > 0`),
])

export const rezervace = mysqlTable('rezervace', {
  id: int('id').primaryKey().autoincrement(),
  akceId: int('akce_id').notNull()
    .references(() => akce.id, { onDelete: 'cascade' }),
  stulId: int('stul_id').notNull()
    .references(() => stul.id, { onDelete: 'restrict' }),
  jmeno: varchar('jmeno', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull(),
  telefon: varchar('telefon', { length: 30 }),
  stav: mysqlEnum('stav', ['cekajici', 'potvrzena', 'zrusena'])
    .notNull().default('cekajici'),
  vytvoreno: datetime('vytvoreno').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => [unique().on(t.akceId, t.stulId)])

export const novinka = mysqlTable('novinka', {
  id: int('id').primaryKey().autoincrement(),
  nazev: varchar('nazev', { length: 200 }).notNull(),
  text: text('text').notNull(),
  datum: datetime('datum').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const foto = mysqlTable('foto', {
  id: int('id').primaryKey().autoincrement(),
  url: varchar('url', { length: 500 }).notNull(),
  popisek: varchar('popisek', { length: 255 }),
})

export const uzivatel = mysqlTable('uzivatel', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  hesloHash: varchar('heslo_hash', { length: 255 }).notNull(),
})