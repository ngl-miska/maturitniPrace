import { useDb, schema } from "../utils/db"

export default defineEventHandler(async () => {
  const db = useDb()
  return await db.select().from(schema.podnik)
})