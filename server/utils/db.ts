import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../database/schema'

let pool: mysql.Pool | undefined

export const useDb = () => {
  pool ??= mysql.createPool(useRuntimeConfig().databaseUrl)
  return drizzle(pool, { schema, mode: 'default' })
}
export { schema }