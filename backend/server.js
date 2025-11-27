// backend/server.js (VERSI PERBAIKAN)

const express = require('express');
const cors = require('cors');
// Impor kedua fungsi dari db.js
const { initializeDatabase, getPool } = require('./db'); 

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Fungsi untuk menjalankan server setelah database siap ---
async function startServer() {
    // TUNGGU sampai database siap
    try {
        await initializeDatabase();
    } catch (error) {
        console.error("Gagal menginisialisasi database:", error);
        process.exit(1);
    }

    // AMBIL Pool koneksi yang sudah pasti siap
    const pool = getPool(); 

    // --- API CRUD ---
    // 1. GET (Read All)
    app.get('/items', async (req, res) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM items ORDER BY id DESC');
            res.json(rows); 
        } catch (err) {
            console.error("Error GET items:", err);
            res.status(500).json({ error: 'Gagal mengambil data inventaris' });
        }
    });

    // 2. POST (Create)
    app.post('/items', async (req, res) => {
        const { name, quantity, price } = req.body;
        
        // Perbaikan Validasi (seperti yang didiskusikan sebelumnya)
        if (!name || name.trim() === '' || quantity === undefined || price === undefined) {
             return res.status(400).json({ error: 'Nama, jumlah, dan harga tidak boleh kosong atau tidak terdefinisi.' });
        }
        if (typeof quantity !== 'number' || quantity < 0 || typeof price !== 'number' || price < 0) {
            return res.status(400).json({ error: 'Jumlah dan harga harus berupa angka positif atau nol.' });
        }
        
        try {
            const [result] = await pool.execute(
                'INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)',
                [name, quantity, price]
            );
            const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [result.insertId]);
            res.status(201).json(rows[0]);
        } catch (err) {
            console.error("Error POST item:", err);
            res.status(500).json({ error: 'Gagal menambahkan barang' });
        }
    });
    
    // [Tambahkan kembali rute PUT dan DELETE di sini, menggunakan 'pool.execute' seperti di atas]
    
    // Jalankan Server setelah semua siap
    app.listen(port, () => {
        console.log(`Server backend berjalan di http://localhost:${port}`);
    });
}

// Panggil fungsi utama untuk memulai aplikasi
startServer();