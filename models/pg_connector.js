const { Pool, Client } = require("pg");

// Define the DB connection
const pool = new Pool({
  user: "postgres",
  password: "tuan123456",
  host: "127.0.0.1",
  port: 5432,
  database: "postgres",
});
module.exports = pool;