// Local PostgreSQL for development, no install/sudo required.
// Usage: npm run db:dev   (then set DATABASE_URL to the printed value)
import EmbeddedPostgres from "embedded-postgres";

const port = Number(process.env.PG_PORT ?? 5433);
const databaseDir = process.env.PG_DATA_DIR ?? ".pgdata";

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "postgres",
  port,
  persistent: true,
});

try {
  await pg.initialise();
} catch {
  // already initialised
}

await pg.start();

try {
  await pg.createDatabase("tuma");
} catch {
  // already exists
}

console.log("");
console.log("Postgres is running. Add this to .env.local:");
console.log(`DATABASE_URL=postgresql://postgres:postgres@localhost:${port}/tuma`);
console.log("");
console.log("Press Ctrl+C to stop.");

process.stdin.resume();
