import pg from "pg";
// Destructure the 'Pool' class from the imported module
const { Pool } = pg;
import "dotenv/config";

const pool = new Pool({
  // Assuming you have set your database config as environment variables
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Export using ES Modules syntax
export default pool;
