// Decode JWT token (không cần thư viện ngoài)
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
};

// Format tiền VND
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format ngày giờ
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Lấy màu badge theo trạng thái đơn hàng
export const getOrderStatusColor = (status) => {
  const map = {
    pending: 'gold',
    delivered: 'green',
    cancelled: 'red',
  };
  return map[status] || 'default';
};

export const getOrderStatusLabel = (status) => {
  const map = {
    pending: 'Chờ xử lý',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };
  return map[status] || status;
};
