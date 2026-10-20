"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function HomePage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal Upload Pin Baru (Create)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // State Modal Edit Pin (Update)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPhotoId, setEditPhotoId] = useState<number | string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  // State Modal Detail Foto (Read Detail)
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  // READ: Ambil data foto dari backend Express (/api/photos)
  const fetchPhotos = () => {
    apiFetch("/photos")
      .then((res) => {
        if (Array.isArray(res)) {
          setPhotos(res);
        } else if (res.data && Array.isArray(res.data)) {
          setPhotos(res.data);
        } else if (res.photos && Array.isArray(res.photos)) {
          setPhotos(res.photos);
        } else {
          setPhotos([]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // CREATE: Unggah Foto Baru ke /api/upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Pilih foto terlebih dahulu!");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi habis atau kamu belum login! Silakan login ulang.");
      window.location.href = "/login";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);
    formData.append("description", description);

    try {
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengunggah foto");

      alert("Pin berhasil diunggah!");
      setShowUploadModal(false);
      setTitle("");
      setDescription("");
      setImageFile(null);
      fetchPhotos();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  // UPDATE: Buka Modal Edit & Simpan Perubahan ke /api/photos/:id
  const openEditModal = (photo: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah agar modal detail tidak ikut terbuka
    setEditPhotoId(photo.id);
    setEditTitle(photo.title || "");
    setEditDescription(photo.description || "");
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPhotoId) return;

    setUpdating(true);
    try {
      await apiFetch(`/photos/${editPhotoId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      alert("Foto berhasil diperbarui!");
      setShowEditModal(false);
      setEditPhotoId(null);
      fetchPhotos();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui foto");
    } finally {
      setUpdating(false);
    }
  };

  // DELETE: Hapus Foto via /api/photos/:id
  const handleDelete = async (photoId: number | string, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah agar modal detail tidak ikut terbuka
    if (!confirm("Apakah kamu yakin ingin menghapus foto ini?")) return;

    try {
      await apiFetch(`/photos/${photoId}`, {
        method: "DELETE",
      });

      alert("Foto berhasil dihapus!");
      fetchPhotos();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus foto");
    }
  };

  // DETAIL: Buka Modal Detail Satu Foto
  const openDetailModal = async (photoId: number) => {
    try {
      const res = await apiFetch(`/photos/${photoId}`);
      setSelectedPhoto(res.data);
    } catch (err: any) {
      alert(err.message || "Gagal mengambil detail foto");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
        <div className="text-[#E60023] font-black text-2xl tracking-tighter">PinPin</div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Beranda</span>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#E60023] text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-red-700 transition"
          >
            Buat Pin Baru
          </button>
        </div>
      </nav>

      {/* Galeri Foto (Layout Grid Pinterest) */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Memuat foto...</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Belum ada foto yang diunggah.</div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
            {photos.map((photo: any, index: number) => (
              <div 
                key={photo.id || index} 
                onClick={() => openDetailModal(photo.id)}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-gray-100 shadow-sm cursor-pointer"
              >
                <img
                  src={photo.image_url || photo.url}
                  alt={photo.title || photo.description || "Pin Foto"}
                  className="w-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Overlay Aksi saat Hover (Edit & Hapus) */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => openEditModal(photo, e)}
                      className="bg-white/90 hover:bg-white text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold shadow transition"
                      title="Edit Pin"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(photo.id, e)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow transition"
                      title="Hapus Pin"
                    >
                      🗑️ Hapus
                    </button>
                  </div>

                  <div>
                    {photo.title && (
                      <p className="text-white text-sm font-bold truncate">{photo.title}</p>
                    )}
                    <p className="text-white text-xs font-medium truncate">
                      {photo.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Upload Pin Baru (Create) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4 text-center">Buat Pin Baru</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[#E60023] hover:file:bg-red-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Pin</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tambahkan judul..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan tentang Pin Anda..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-[#E60023] text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {uploading ? "Mengunggah..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Pin (Update) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Judul & Deskripsi</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Pin</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-[#E60023] text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {updating ? "Menyimpan..." : "Perbarui"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Detail Satu Foto (Read Detail) */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[85vh]">
            
            {/* Bagian Kiri: Gambar */}
            <div className="md:w-1/2 bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title}
                className="max-h-[60vh] md:max-h-[85vh] w-full object-contain"
              />
            </div>

            {/* Bagian Kanan: Informasi */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                {/* Tombol Tutup */}
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Profil Pembuat */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#E60023] text-white flex items-center justify-center font-bold uppercase">
                    {selectedPhoto.username ? selectedPhoto.username[0] : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{selectedPhoto.username || "Anonim"}</p>
                    <p className="text-xs text-gray-400">
                      {selectedPhoto.created_at ? new Date(selectedPhoto.created_at).toLocaleDateString("id-ID") : ""}
                    </p>
                  </div>
                </div>

                {/* Judul & Deskripsi */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPhoto.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedPhoto.description || "Tidak ada deskripsi."}
                </p>
              </div>

              {/* Tombol Tutup Bawah */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-full font-semibold text-sm transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}