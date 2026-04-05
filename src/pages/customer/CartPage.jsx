import { useEffect, useState } from 'react';
import { Table, Button, InputNumber, Typography, Card, Empty, Space, Popconfirm, Spin } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import cartApi from '../../api/cartApi';
import productApi from '../../api/productApi';
import { formatCurrency } from '../../utils/helpers';
import { getProductImage } from '../../utils/imageHelper';
import { App } from 'antd';

const { Title, Text } = Typography;

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [productMap, setProductMap] = useState({}); // productId -> product info
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setCart(res);

      // Lấy thông tin sản phẩm (giá, tên, ảnh) từ danh sách products trong cart
      const items = res?.products || [];
      if (items.length > 0) {
        const allProducts = await productApi.getAll();
        const arr = Array.isArray(allProducts) ? allProducts : (allProducts?.products || []);
        const map = {};
        arr.forEach((p) => { map[p._id] = p; });
        setProductMap(map);
      }
    } catch {
      message.error('Không thể tải giỏ hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleModify = async (productId, quantity) => {
    try {
      await cartApi.modifyItem({ product: productId, quantity });
      fetchCart();
    } catch (err) {
      message.error(err?.message || 'Cập nhật thất bại');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await cartApi.removeItem({ product: productId });
      message.success('Đã xóa khỏi giỏ hàng');
      fetchCart();
    } catch (err) {
      message.error(err?.message || 'Xóa thất bại');
    }
  };

  // BE lưu arr `products: [{product: ObjectId, quantity: N}]`
  const items = cart?.products || [];

  const total = items.reduce((sum, item) => {
    const pid = item.product?._id || item.product;
    const price = productMap[pid]?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const columns = [
    {
      title: 'Sản phẩm', key: 'product',
      render: (_, item) => {
        const pid = item.product?._id || item.product;
        const prod = productMap[pid] || {};
        return (
          <Space>
            <img
              src={getProductImage(prod)}
              alt=""
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{prod.title || pid}</div>
              <Text type="danger">{formatCurrency(prod.price || 0)}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 150,
      render: (qty, item) => (
        <InputNumber
          min={1}
          value={qty}
          onChange={(val) => handleModify(item.product?._id || item.product, val)}
        />
      ),
    },
    {
      title: 'Thành tiền', key: 'subtotal',
      render: (_, item) => {
        const pid = item.product?._id || item.product;
        const price = productMap[pid]?.price || 0;
        return <Text strong type="danger">{formatCurrency(price * item.quantity)}</Text>;
      },
    },
    {
      title: '', key: 'action', width: 60,
      render: (_, item) => (
        <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleRemove(item.product?._id || item.product)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div className="page-container">
      <Title level={3}>🛒 Giỏ hàng của tôi</Title>
      {items.length === 0 ? (
        <Empty description="Giỏ hàng trống">
          <Button type="primary" onClick={() => navigate('/products')}>Mua sắm ngay</Button>
        </Empty>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={items}
            rowKey={(r) => r.product?._id || r.product}
            pagination={false}
          />
          <Card style={{ marginTop: 16, textAlign: 'right' }}>
            <Title level={4}>
              Tổng cộng: <Text type="danger">{formatCurrency(total)}</Text>
            </Title>
            <Button
              type="primary" size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/checkout', { state: { cartItems: items, productMap, total } })}
            >
              Tiến hành đặt hàng
            </Button>
          </Card>
        </>
      )}
    </div>
  );
};

export default CartPage;
