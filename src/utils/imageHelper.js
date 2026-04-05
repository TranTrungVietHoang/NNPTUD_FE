// Helper lấy URL ảnh từ product.images[] của BE
// BE lưu local path (vd: "uploads/abc.jpg") hoặc URL đầy đủ
const BE_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export const getProductImage = (product) => {
  if (!product) return 'https://via.placeholder.com/300x200?text=No+Image';
  const imgs = product.images;
  if (!imgs || imgs.length === 0) return 'https://via.placeholder.com/300x200?text=No+Image';
  const img = Array.isArray(imgs) ? imgs[0] : imgs;
  if (!img || img === 'https://i.imgur.com/cHddUCu.jpeg') return img;
  if (img.startsWith('http')) {
    // Tự động sửa lỗi URL cũ bị lưu sai trong database thành URL local đúng
    if (img.includes('/api/v1/uploads/')) {
        return img.replace('/api/v1/uploads/', '/uploads/');
    }
    return img;
  }
  // Local path: uploads/filename.jpg → http://localhost:3000/uploads/filename.jpg
  return `${BE_BASE}/uploads/${img.split(/[\\/]/).pop()}`;
};
