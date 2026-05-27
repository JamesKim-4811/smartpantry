import { Database } from "sql.js";
import { getDb, saveDb } from "./db";

// Runs a SELECT and returns rows as plain objects
export function query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): T[] {
  const db: Database = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

// Runs an INSERT/UPDATE/DELETE and returns the last inserted rowid
export function execute(
  sql: string,
  params: (string | number | null | boolean)[] = []
): number {
  const db: Database = getDb();
  // sql.js doesn't support parameterized statements for run() in the same way,
  // so we prepare and step
  const stmt = db.prepare(sql);
  stmt.run(params as (string | number | null)[]);
  stmt.free();
  const idResult = db.exec("SELECT last_insert_rowid() as id");
  const id = (idResult[0]?.values[0]?.[0] as number) ?? 0;
  saveDb(); // persist after every write
  return id;
}
