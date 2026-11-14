import { eq } from 'drizzle-orm'
import { useDb, schema } from '../utils/db'

export default defineEventHandler(async (event) => {
  const { akceId, stulId, jmeno, email, telefon } = await readBody(event)
  if (!akceId || !stulId || !jmeno || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Chybí povinné údaje' })
  }

  const db = useDb()
  const [a] = await db.select().from(schema.akce).where(eq(schema.akce.id, akceId))
  const [s] = await db.select().from(schema.stul).where(eq(schema.stul.id, stulId))

  // dokument říká, že tohle musí hlídat aplikace, ne databáze
  if (!a || !s || a.podnikId !== s.podnikId) {
    throw createError({ statusCode: 400, statusMessage: 'Stůl nepatří k podniku akce' })
  }

  try {
    await db.insert(schema.rezervace).values({ akceId, stulId, jmeno, email, telefon })
  } catch (err: any) {
    const code = err?.code ?? err?.cause?.code
    if (code === 'ER_DUP_ENTRY') {
      throw createError({ statusCode: 409, statusMessage: 'Stůl je už rezervovaný' })
    }
    throw err
  }
  return { ok: true }
})