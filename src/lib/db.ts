import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var _pgSchemaReady: Promise<void> | undefined;
}

function getPool(): Pool {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return global._pgPool;
}

async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cuit TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      hectares DOUBLE PRECISION,
      "timestamp" TIMESTAMPTZ NOT NULL,
      answers JSONB NOT NULL,
      profile TEXT NOT NULL DEFAULT '',
      area_trend TEXT NOT NULL DEFAULT '',
      main_issue TEXT NOT NULL DEFAULT '',
      recommendations JSONB NOT NULL,
      primary_recommendation TEXT NOT NULL
    )
  `);

  // Migrate older deployments that still have the "phone" column
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations' AND column_name = 'phone'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations' AND column_name = 'cuit'
      ) THEN
        ALTER TABLE registrations RENAME COLUMN phone TO cuit;
      END IF;
    END $$;
  `);
}

export async function getDb(): Promise<Pool> {
  const pool = getPool();
  if (!global._pgSchemaReady) {
    global._pgSchemaReady = ensureSchema(pool);
  }
  await global._pgSchemaReady;
  return pool;
}
