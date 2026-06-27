require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const mysql = require('mysql2/promise');

// Parse DATABASE_URL with safe fallbacks
let dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'teknova'
};

if (process.env.DATABASE_URL) {
    try {
        const url = new URL(process.env.DATABASE_URL);
        dbConfig.host = url.hostname;
        dbConfig.port = Number(url.port || '3306');
        dbConfig.user = url.username;
        dbConfig.password = decodeURIComponent(url.password || '');
        dbConfig.database = url.pathname.replace(/^\//, '');
    } catch (e) {
        console.error("Failed to parse DATABASE_URL, using individual env vars or defaults:", e);
    }
}

console.log(dbConfig)

// Fallback to individual env vars if defined
if (process.env.DB_HOST) dbConfig.host = process.env.DB_HOST;
if (process.env.DB_PORT) dbConfig.port = Number(process.env.DB_PORT);
if (process.env.DB_USER) dbConfig.user = process.env.DB_USER;
if (process.env.DB_PWD) dbConfig.password = process.env.DB_PWD;
if (process.env.DB_NAME) dbConfig.database = process.env.DB_NAME;

const adapter = new PrismaMariaDb({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
});

// try {
//     adapter.connect()
// }catch(error){
//     console.log("wrror while connecting to db", error)
// }

const prisma = new PrismaClient({ adapter });

async function createDatabaseIfNotExists() {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await connection.end();
}

module.exports = {
    prisma,
    conn: prisma,
    createDatabaseIfNotExists
};