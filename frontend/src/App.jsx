// frontend/src/App.jsx (VERSI TAMPILAN BARU)

import { useState, useEffect } from 'react';
import axios from 'axios';

// URL dasar API backend
const API_URL = 'http://localhost:5000/items'; 

function App() {
  const [items, setItems] = useState([]); 
  const [form, setForm] = useState({ name: '', quantity: '', price: '' }); 
  const [isEditing, setIsEditing] = useState(false); 
  const [editingId, setEditingId] = useState(null); 

  // **Fungsi 1: Ambil Data (Read)**
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

  // Handler untuk perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Mengizinkan string kosong ('') untuk form input number agar user bisa menghapus input
    const processedValue = (name === 'quantity' || name === 'price') 
                           ? (value === '' ? '' : Number(value)) 
                           : value;

    setForm({ ...form, [name]: processedValue });
  };

  // **Fungsi 2: Tambah/Update Barang (Create/Update)**
  const handleSubmit = async (e) => {
    e.preventDefault();
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
      // Pesan error di sini berasal dari backend jika validasi gagal
      alert('Gagal menyimpan barang. Pastikan semua field terisi benar.');
    }
  };

  // **Fungsi 3: Atur Mode Edit**
  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    // Konversi nilai number dari item ke string agar value input terisi dengan benar
    setForm({ 
      name: item.name, 
      quantity: String(item.quantity), 
      price: String(item.price) 
    }); 
  };

  // **Fungsi 4: Hapus Barang (Delete)**
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
  
  // Fungsi utilitas untuk format rupiah
  const formatRupiah = (number) => {
    return `Rp ${Number(number).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
  };


  return (
    // Background dan layout utama
    <div className="min-h-screen bg-gray-50 pb-12">
      
      {/* HEADER SECTION (Modern Look) */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-xl py-10 mb-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            📦 Inventory Management System
          </h1>
          <p className="text-indigo-200 mt-2">Dikelola dengan React, Node.js, dan MySQL</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        
        {/* CARD FORM TAMBAH/EDIT BARANG */}
        <section className="bg-white p-6 shadow-2xl rounded-xl ring-1 ring-gray-100 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
            {isEditing ? '✏️ Edit Item' : '➕ Add New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Input Name */}
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Contoh: Monitor LED"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            
            {/* Input Quantity */}
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Unit)</label>
                <input
                    type="number"
                    name="quantity"
                    placeholder="10"
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            
            {/* Input Price */}
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                <input
                    type="number"
                    name="price"
                    placeholder="1500000.00"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    step="0.01" 
                    required
                />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-1 flex space-x-2">
                <button
                    type="submit"
                    className={`flex-grow p-3 rounded-lg font-semibold text-white transition duration-200 ${
                        isEditing 
                            ? 'bg-yellow-500 hover:bg-yellow-600 shadow-md hover:shadow-lg' 
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                >
                    {isEditing ? 'Simpan Perubahan' : 'Tambahkan Item'}
                </button>

                {isEditing && (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setEditingId(null);
                            setForm({ name: '', quantity: '', price: '' });
                        }}
                        className="p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                    >
                        Batal
                    </button>
                )}
            </div>
          </form>
        </section>

        {/* TABEL INVENTARIS BARANG */}
        <section className="bg-white p-6 shadow-2xl rounded-xl ring-1 ring-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Daftar Inventaris</h2>
          {items.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg text-gray-500">
                <p className="text-lg font-medium">Inventaris Kosong.</p>
                <p>Silakan tambahkan barang baru menggunakan formulir di atas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Nama Barang</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Harga Satuan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Total Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition duration-150'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(item.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-md font-semibold text-indigo-600">{formatRupiah(item.quantity * Number(item.price))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition duration-150"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-150"
                        >
                          Hapus
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