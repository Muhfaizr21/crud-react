// frontend/src/App.jsx (VERSI ULTRA-MODERN)

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
// Anda mungkin perlu menginstal react-icons jika ingin menggunakan ikon: npm install react-icons
import { FiPackage, FiDollarSign, FiBarChart2, FiEdit, FiTrash2, FiPlusCircle } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/items'; 

// Fungsi utilitas untuk format rupiah
const formatRupiah = (number) => {
    // Pastikan input adalah number, karena data dari MySQL bisa berupa string
    const num = Number(number); 
    return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
};

// --- Komponen Card Metrik ---
const MetricCard = ({ icon: Icon, title, value, colorClass }) => (
    <div className={`p-5 rounded-xl shadow-lg ${colorClass} text-white transition duration-300 hover:scale-[1.02] transform`}>
        <div className="flex items-center justify-between">
            <Icon className="text-3xl opacity-70" />
            <span className="text-xs font-semibold uppercase">{title}</span>
        </div>
        <div className="mt-2 text-2xl font-extrabold">{value}</div>
    </div>
);
// --- Akhir Komponen Card Metrik ---

function App() {
  const [items, setItems] = useState([]); 
  const [form, setForm] = useState({ name: '', quantity: '', price: '' }); 
  const [isEditing, setIsEditing] = useState(false); 
  const [editingId, setEditingId] = useState(null); 

  // Hitung Metrik Penting menggunakan useMemo (untuk efisiensi)
  const inventoryMetrics = useMemo(() => {
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const totalValue = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    
    return {
        totalItems,
        totalStock,
        totalValue: formatRupiah(totalValue)
    };
  }, [items]); // Hitung ulang hanya jika daftar items berubah

  const fetchItems = async () => {
    try {
      const response = await axios.get(API_URL);
      setItems(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = (name === 'quantity' || name === 'price') 
                           ? (value === '' ? '' : Number(value)) 
                           : value;

    setForm({ ...form, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi dasar di frontend (meskipun backend juga sudah memvalidasi)
    if (!form.name || form.quantity === '' || form.price === '') {
        alert('Mohon lengkapi semua field.');
        return;
    }
    
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${editingId}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      
      setForm({ name: '', quantity: '', price: '' });
      setIsEditing(false);
      setEditingId(null);
      fetchItems(); 
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert('Gagal menyimpan barang. Pastikan semua field terisi benar dan server berjalan.');
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setForm({ 
      name: item.name, 
      quantity: String(item.quantity), 
      price: String(item.price) 
    }); 
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus barang ini?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setItems(items.filter(item => item.id !== id)); 
      } catch (error) {
        console.error("Gagal menghapus data:", error);
      }
    }
  };


  return (
    // Background dan layout utama
    <div className="min-h-screen bg-gray-100 pb-16">
      
      {/* HEADER SECTION (Gradient dan Shadow Kuat) */}
      <header className="bg-gradient-to-br from-purple-700 to-indigo-600 shadow-2xl py-12 mb-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            INVENTORY DASHBOARD
          </h1>
          <p className="text-purple-200 mt-2 font-light">Kelola Stok Barang Anda Secara Real-Time</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* METRIC CARDS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <MetricCard 
                icon={FiPackage}
                title="Total Jenis Barang"
                value={inventoryMetrics.totalItems}
                colorClass="bg-green-500 shadow-md shadow-green-200"
            />
            <MetricCard 
                icon={FiBarChart2}
                title="Total Stok Unit"
                value={inventoryMetrics.totalStock.toLocaleString('id-ID')}
                colorClass="bg-blue-500 shadow-md shadow-blue-200"
            />
            <MetricCard 
                icon={FiDollarSign}
                title="Total Nilai Inventaris"
                value={inventoryMetrics.totalValue}
                colorClass="bg-red-500 shadow-md shadow-red-200"
            />
        </div>
        
        {/* CARD FORM TAMBAH/EDIT BARANG */}
        <section className="bg-white p-6 shadow-xl rounded-xl ring-1 ring-gray-200 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            {isEditing ? <FiEdit className="mr-2 text-yellow-600" /> : <FiPlusCircle className="mr-2 text-indigo-600" />}
            {isEditing ? 'Edit Informasi Barang' : 'Input Barang Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
            
            <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nama Barang</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Contoh: SSD 500GB"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    required
                />
            </div>
            
            <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Jumlah</label>
                <input
                    type="number"
                    name="quantity"
                    placeholder="10"
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    required
                />
            </div>
            
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Harga Satuan (Rp)</label>
                <input
                    type="number"
                    name="price"
                    placeholder="1500000.00"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    step="0.01" 
                    required
                />
            </div>

            <div className="md:col-span-1 flex space-x-2">
                <button
                    type="submit"
                    className={`flex-grow p-3 rounded-lg font-bold text-white transition duration-300 hover:shadow-xl ${
                        isEditing 
                            ? 'bg-yellow-500 hover:bg-yellow-600' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isEditing ? 'SIMPAN' : 'TAMBAH'}
                </button>

                {isEditing && (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setEditingId(null);
                            setForm({ name: '', quantity: '', price: '' });
                        }}
                        className="p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-300"
                    >
                        Batal
                    </button>
                )}
            </div>
          </form>
        </section>

        {/* TABEL INVENTARIS BARANG */}
        <section className="bg-white p-6 shadow-xl rounded-xl ring-1 ring-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Daftar Stok Inventaris</h2>
          {items.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-lg text-gray-500 border border-dashed border-gray-300">
                <FiPackage className="mx-auto text-6xl mb-3 text-gray-400" />
                <p className="text-xl font-semibold">Data Inventaris Kosong.</p>
                <p>Mulai dengan menambahkan item pertama Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-100/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">Nama Barang</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">Harga Satuan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">Total Nilai</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-indigo-50 transition duration-150">
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                      <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{item.quantity} Unit</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{formatRupiah(item.price)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-md font-extrabold text-red-600">{formatRupiah(item.quantity * Number(item.price))}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition duration-150"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition duration-150"
                          title="Hapus"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;