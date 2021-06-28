const { Pool } = require("pg");

module.exports = new Pool({
    user: "postgres",
    password: "secret",
    database: "workbench",
    host: "localhost",
    port: 5432
});