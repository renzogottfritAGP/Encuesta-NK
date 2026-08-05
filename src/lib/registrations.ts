import { getDb } from "./db";

export interface Registration {
  id: string;
  name: string;
  cuit: string;
  location: string;
  hectares: number | null;
  timestamp: string;
  answers: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  profile: string;
  areaTrend: string;
  mainIssue: string;
  recommendations: {
    hybrid: string;
    percentage: number;
    score: number;
  }[];
  primaryRecommendation: string;
}

interface RegistrationRow {
  id: string;
  name: string;
  cuit: string;
  location: string;
  hectares: number | null;
  timestamp: Date;
  answers: Registration["answers"];
  profile: string;
  area_trend: string;
  main_issue: string;
  recommendations: Registration["recommendations"];
  primary_recommendation: string;
}

function rowToRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    name: row.name,
    cuit: row.cuit,
    location: row.location,
    hectares: row.hectares,
    timestamp: new Date(row.timestamp).toISOString(),
    answers: row.answers,
    profile: row.profile,
    areaTrend: row.area_trend,
    mainIssue: row.main_issue,
    recommendations: row.recommendations,
    primaryRecommendation: row.primary_recommendation,
  };
}

export async function listRegistrations(): Promise<Registration[]> {
  const db = await getDb();
  const result = await db.query<RegistrationRow>(
    `SELECT * FROM registrations ORDER BY "timestamp" DESC`
  );
  return result.rows.map(rowToRegistration);
}

export async function insertRegistration(reg: Registration): Promise<void> {
  const db = await getDb();
  await db.query(
    `INSERT INTO registrations
      (id, name, cuit, location, hectares, "timestamp", answers, profile, area_trend, main_issue, recommendations, primary_recommendation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (id) DO NOTHING`,
    [
      reg.id,
      reg.name,
      reg.cuit,
      reg.location,
      reg.hectares,
      reg.timestamp,
      JSON.stringify(reg.answers),
      reg.profile,
      reg.areaTrend,
      reg.mainIssue,
      JSON.stringify(reg.recommendations),
      reg.primaryRecommendation,
    ]
  );
}

export async function deleteAllRegistrations(): Promise<void> {
  const db = await getDb();
  await db.query(`DELETE FROM registrations`);
}

export async function importRegistrations(regs: Registration[]): Promise<number> {
  let imported = 0;
  for (const reg of regs) {
    if (
      !reg ||
      typeof reg.id !== "string" ||
      typeof reg.name !== "string" ||
      typeof reg.cuit !== "string"
    ) {
      continue;
    }
    await insertRegistration(reg);
    imported += 1;
  }
  return imported;
}
