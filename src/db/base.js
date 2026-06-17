require("dotenv").config()
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const mysql = require('mysql2/promise');

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PWD || '',
    database: process.env.DB_NAME || 'teknova',
});

const prisma = new PrismaClient({ adapter });

async function createDatabaseIfNotExists() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PWD || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'teknova'}\`;`);
    await connection.end();
}

module.exports = {
    prisma,
    conn: prisma,
    createDatabaseIfNotExists
}