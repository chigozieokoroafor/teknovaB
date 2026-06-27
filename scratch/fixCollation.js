require("dotenv").config();
const mysql = require('mysql2/promise');

async function fixCollation() {
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
            console.error("Failed to parse DATABASE_URL:", e);
        }
    }

    console.log(`Connecting to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}...`);
    
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });

    try {
        console.log("Setting database default character set and collation...");
        await connection.query(`ALTER DATABASE \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);

        console.log("Fetching tables...");
        const [tables] = await connection.query("SHOW TABLES");
        const keyName = `Tables_in_${dbConfig.database}`;

        for (const row of tables) {
            const tableName = row[keyName] || Object.values(row)[0];
            console.log(`Altering table: ${tableName}...`);
            await connection.query(`ALTER TABLE \`${tableName}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        }

        console.log("Collation fix completed successfully!");
    } catch (err) {
        console.error("Error during collation fix:", err);
    } finally {
        await connection.end();
    }
}

fixCollation().catch(console.error);
