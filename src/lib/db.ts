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
      phone TEXT NOT NULL,
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
}

export async function getDb(): Promise<Pool> {
  const pool = getPool();
  if (!global._pgSchemaReady) {
    global._pgSchemaReady = ensureSchema(pool);
  }
  await global._pgSchemaReady;
  return pool;
}
