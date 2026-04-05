import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Button, Tag, Spin, Input, Select } from 'antd';
import { ShoppingCartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import cartApi from '../../api/cartApi';
import { formatCurrency } from '../../utils/helpers';
import { getProductImage } from '../../utils/imageHelper';
import { useAuth } from '../../contexts/AuthContext';
import { App } from 'antd';

const { Title, Text } = Typography;
const { Search } = Input;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([productApi.getAll(), categoryApi.getAll()]);
        setProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.products || prodRes?.data || []));
        setCategories(Array.isArray(catRes) ? catRes : (catRes?.categories || catRes?.data || []));
      } catch {
        message.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) { navigate('/login'); return; }
    try {
      await cartApi.addItem({ product: product._id, quantity: 1 });
      message.success(`Đã thêm "${product.title}" vào giỏ hàng!`);
    } catch (err) {
      message.error(err?.message || 'Thêm vào giỏ thất bại');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => (p.category?._id || p.category) === selectedCategory)
    : products;

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div className="page-container">
      {/* Banner */}
      <Card style={{ background: 'linear-gradient(135deg, #1677ff 0%, #003eb3 100%)', marginBottom: 24, border: 0 }}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>🛒 Chào mừng đến NNPTUD Shop</Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>Mua sắm thông minh, tiết kiệm tối đa</Text>
          <br /><br />
          <Button type="default" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/products')}>
            Xem tất cả sản phẩm
          </Button>
        </div>
      </Card>

      {/* Categories */}
      <Title level={4} style={{ marginBottom: 12 }}>📂 Danh mục</Title>
      <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Tag
          color={!selectedCategory ? 'blue' : 'default'}
          style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 14 }}
          onClick={() => setSelectedCategory(null)}
        >
          Tất cả
        </Tag>
        {categories.map((cat) => (
          <Tag
            key={cat._id}
            color={selectedCategory === cat._id ? 'blue' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 14 }}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </Tag>
        ))}
      </div>

      {/* Products Grid */}
      <Title level={4} style={{ marginBottom: 16 }}>🔥 Sản phẩm nổi bật</Title>
      <Row gutter={[16, 16]}>
        {filteredProducts.slice(0, 12).map((product) => (
          <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <img
                  alt={product.title}
                  src={getProductImage(product)}
                  style={{ height: 180, objectFit: 'cover' }}
                  onClick={() => navigate(`/products/${product._id}`)}
                />
              }
              actions={[
                <Button key="detail" type="link" onClick={() => navigate(`/products/${product._id}`)}>Chi tiết</Button>,
                <Button key="cart" type="primary" size="small" icon={<ShoppingCartOutlined />} onClick={() => handleAddToCart(product)}>Thêm giỏ</Button>,
              ]}
            >
              <Card.Meta
                title={<span style={{ fontSize: 14 }}>{product.title}</span>}
                description={
                  <Text type="danger" strong style={{ fontSize: 16 }}>
                    {formatCurrency(product.price)}
                  </Text>
                }
              />
              {product.category?.name && <Tag color="geekblue" style={{ marginTop: 8 }}>{product.category.name}</Tag>}
            </Card>
          </Col>
        ))}
      </Row>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
          Không có sản phẩm nào
        </div>
      )}
    </div>
  );
};

export default HomePage;
