// backend/db.js (VERSI PERBAIKAN)

require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

let pool; // Variabel pool tetap di sini

// 1. Fungsi Inisialisasi sekarang mengembalikan Pool yang sudah dibuat
async function initializeDatabase() {
    if (pool) return pool; // Jika sudah ada, kembalikan saja

    try {
        // [Kode untuk membuat database dan tabel tetap sama]
        const tempConnection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            port: config.port
        });
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
        await tempConnection.end();

        // 2. Buat Pool dan simpan ke variabel pool
        pool = mysql.createPool(config);
        
        const connection = await pool.getConnection();
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        connection.release();
        console.log("Database dan Pool koneksi MySQL siap.");
        
        return pool; // Mengembalikan pool yang sudah jadi

    } catch (error) {
        console.error('Koneksi atau inisialisasi database MySQL gagal:', error);
        process.exit(1);
    }
}

// 3. Kita hanya mengekspor fungsi inisialisasi
module.exports = {
    initializeDatabase,
    // Fungsi untuk mendapatkan Pool setelah inisialisasi
    getPool: () => {
        if (!pool) {
            throw new Error("Pool belum diinisialisasi. Pastikan initializeDatabase sudah dipanggil dan selesai.");
        }
        return pool;
    }
};