import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Button, Tag, Spin, InputNumber, Select } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import cartApi from '../../api/cartApi';
import { formatCurrency } from '../../utils/helpers';
import { getProductImage } from '../../utils/imageHelper';
import { useAuth } from '../../contexts/AuthContext';
import { App } from 'antd';

const { Title, Text } = Typography;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (minPrice) params.min = minPrice;
      const res = await productApi.getAll(params);
      setProducts(Array.isArray(res) ? res : (res?.products || res?.data || []));
    } catch {
      message.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(Array.isArray(res) ? res : (res?.categories || res?.data || [])));
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) { navigate('/login'); return; }
    try {
      await cartApi.addItem({ product: product._id, quantity: 1 });
      message.success('Đã thêm vào giỏ hàng!');
    } catch (err) {
      message.error(err?.message || 'Thêm vào giỏ thất bại');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => (p.category?._id || p.category) === selectedCategory)
    : products;

  return (
    <div className="page-container">
      <Title level={3}>🛍️ Tất cả sản phẩm</Title>

      {/* Filters */}
      <Card style={{ marginBottom: 20 }} size="small">
        <Row gutter={16} align="middle">
          <Col>
            <Text>Lọc theo danh mục:</Text>
            <Select
              allowClear
              placeholder="Tất cả danh mục"
              style={{ width: 200, marginLeft: 8 }}
              onChange={setSelectedCategory}
            >
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Text>Giá tối thiểu:</Text>
            <InputNumber
              style={{ width: 150, marginLeft: 8 }}
              placeholder="0"
              min={0}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              onChange={setMinPrice}
            />
            <Button type="primary" style={{ marginLeft: 8 }} onClick={fetchProducts}>Lọc</Button>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProducts.map((product) => (
            <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <img
                    alt={product.title}
                    src={getProductImage(product)}
                    style={{ height: 180, objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  />
                }
                actions={[
                  <Button key="detail" type="link" onClick={() => navigate(`/products/${product._id}`)}>Xem chi tiết</Button>,
                  <Button key="cart" type="primary" size="small" icon={<ShoppingCartOutlined />} onClick={() => handleAddToCart(product)}>
                    Thêm giỏ
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={product.title}
                  description={
                    <>
                      <Text type="danger" strong style={{ fontSize: 16 }}>{formatCurrency(product.price)}</Text>
                      {product.category?.name && <Tag color="geekblue" style={{ marginLeft: 8 }}>{product.category.name}</Tag>}
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
          {filteredProducts.length === 0 && (
            <Col span={24} style={{ textAlign: 'center', padding: 60, color: '#999' }}>Không có sản phẩm nào</Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default ProductListPage;
