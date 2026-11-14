# Rezervační aplikace (maturitní práce)

Webová rezervační aplikace pro akce pořádané v různých podnicích. Postavená na [Nuxtu](https://nuxt.com), data jsou uložená v MySQL/MariaDB a přistupuje se k nim přes [Drizzle ORM](https://orm.drizzle.team).

## Požadavky

- [Node.js](https://nodejs.org) (doporučená LTS verze)
- MySQL nebo MariaDB (např. přes [XAMPP](https://www.apachefriends.org))

## Instalace

```bash
npm install
```

Použité balíčky pro databázi:

```bash
npm i drizzle-orm mysql2
npm i -D drizzle-kit
```

## Nastavení databáze

### 1. Spuštění MySQL

V XAMPP Control Panelu spusť modul **MySQL** (a **Apache**, pokud chceš používat phpMyAdmin).

### 2. Vytvoření databáze

V phpMyAdminu (http://localhost/phpmyadmin):

1. Klikni na **Nová** a vytvoř databázi `rezervace` s porovnáním `utf8mb4_general_ci` (nebo `utf8mb4_czech_ci`).
2. Vyber ji v levém panelu.
3. Na záložce **SQL** spusť skript z přílohy A databázového modelu (`databazovy_model.pdf`).

Vznikne osm tabulek: `podnik`, `zarizeni`, `akce`, `stul`, `rezervace`, `novinka`, `foto`, `uzivatel`.

### 3. Soubor `.env`

V kořeni projektu (vedle `package.json`) vytvoř soubor `.env` s vlastními přihlašovacími údaji k databázi:

```env
NUXT_DATABASE_URL=mysql://UZIVATEL:HESLO@HOST:PORT/DATABAZE
```

- Hodnoty `UZIVATEL`, `HESLO`, `HOST`, `PORT` a `DATABAZE` nahraď svými.
- Speciální znaky v hesle musí být zakódované (např. `@` jako `%40`, `#` jako `%23`).
- Soubor `.env` **nikdy neukládej do Gitu** (je v `.gitignore`) a nesdílej ho.

### 4. Runtime config

V `nuxt.config.ts` je přidaná položka, která načte proměnnou z `.env` a drží ji pouze na serveru:

```ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: '' // doplní se z NUXT_DATABASE_URL
  }
})
```

## Struktura serverové části

```
server/
├── api/
│   └── test.get.ts        # testovací endpoint
├── database/
│   └── schema.ts          # definice tabulek (Drizzle)
└── utils/
    └── db.ts              # připojení k databázi (useDb)
```

- **`server/database/schema.ts`** – schéma všech osmi tabulek odpovídající databázovému modelu (včetně cizích klíčů, unikátních klíčů a kontroly kapacity stolu).
- **`server/utils/db.ts`** – exportuje funkci `useDb()` a objekt `schema`. Spojení se vytváří jako pool a znovu se používá. Nuxt tyto exporty automaticky importuje do API routes, není třeba je importovat ručně.

Tok údajů:

```
.env (NUXT_DATABASE_URL) → runtimeConfig.databaseUrl → useDb() → db
```

## Spuštění

```bash
npm run dev
```

Aplikace poběží na http://localhost:3000.

### Test připojení k databázi

Otevři http://localhost:3000/api/test

- `[]` nebo seznam podniků = připojení funguje
- chyba `ECONNREFUSED` = MySQL neběží (zkontroluj XAMPP)
- chyba `Unknown database` = databáze `rezervace` neexistuje
- chyba `Access denied` = špatné jméno nebo heslo v `.env`

Po ověření testovací route `server/api/test.get.ts` smaž.

## Použití databáze v API

```ts
// server/api/podniky.get.ts
export default defineEventHandler(async () => {
  const db = useDb()
  return await db.select().from(schema.podnik)
})
```

### Vytvoření rezervace

Při vytváření rezervace musí aplikace sama ověřit, že stůl i akce patří ke stejnému podniku (databáze to nehlídá). Duplicitní rezervaci stejného stolu na stejné akci zachytí unikátní klíč `(akce_id, stul_id)` – chyba `ER_DUP_ENTRY` se vrací jako HTTP 409.

## Poznámky k návrhu

- Zrušená rezervace se maže, aby se uvolnil stůl pro novou rezervaci. Hodnota `zrusena` ve sloupci `stav` se proto nepoužívá.
- Hesla administrátorů (`uzivatel.heslo_hash`) se ukládají pouze jako hash (Argon2 nebo bcrypt).
- XAMPP používá MariaDB, která je s tímto projektem kompatibilní.

## Užitečné odkazy

- [Nuxt – server directory](https://nuxt.com/docs/guide/directory-structure/server)
- [Nuxt – runtime config](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Drizzle ORM – MySQL](https://orm.drizzle.team/docs/get-started-mysql)
