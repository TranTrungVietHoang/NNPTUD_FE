import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Tag, Spin, Descriptions, Rate, Form, Input, List, Avatar, Typography, Divider, InputNumber } from 'antd';
import { ShoppingCartOutlined, BookOutlined } from '@ant-design/icons';
import productApi from '../../api/productApi';
import inventoryApi from '../../api/inventoryApi';
import reviewApi from '../../api/reviewApi';
import cartApi from '../../api/cartApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { getProductImage } from '../../utils/imageHelper';
import { useAuth } from '../../contexts/AuthContext';
import { App } from 'antd';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();

  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, invRes, revRes] = await Promise.all([
          productApi.getById(id),
          inventoryApi.getByProduct(id).catch(() => null),
          reviewApi.getByProduct(id).catch(() => []),
        ]);
        setProduct(prodRes?.product || prodRes);
        setInventory(invRes);
        setReviews(Array.isArray(revRes) ? revRes : (revRes?.reviews || []));
      } catch {
        message.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await cartApi.addItem({ product: id, quantity });
      message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } catch (err) {
      message.error(err?.message || 'Thêm vào giỏ thất bại');
    }
  };

  const handleReview = async (values) => {
    if (!user) { navigate('/login'); return; }
    try {
      await reviewApi.create({ product: id, ...values });
      message.success('Đã gửi đánh giá!');
      reviewForm.resetFields();
      const revRes = await reviewApi.getByProduct(id);
      setReviews(Array.isArray(revRes) ? revRes : (revRes?.reviews || []));
    } catch (err) {
      message.error(err?.message || 'Gửi đánh giá thất bại');
    }
  };

  const stock = inventory?.stock ?? inventory?.quantity ?? 0;

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 80 }}>Không tìm thấy sản phẩm</div>;

  return (
    <div className="page-container">
      <Row gutter={[24, 24]}>
        {/* Image */}
        <Col xs={24} md={10}>
          <img
            src={getProductImage(product)}
            alt={product.title}
            style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 400 }}
          />
        </Col>

        {/* Info */}
        <Col xs={24} md={14}>
          <Title level={3}>{product.title}</Title>
          <Title level={2} type="danger" style={{ margin: '8px 0' }}>{formatCurrency(product.price)}</Title>
          {product.category?.name && <Tag color="blue" style={{ marginBottom: 12 }}>{product.category.name}</Tag>}

          <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Tồn kho">
              <Tag color={stock > 5 ? 'green' : stock > 0 ? 'orange' : 'red'}>
                {stock > 0 ? `${stock} sản phẩm` : 'Hết hàng'}
              </Tag>
            </Descriptions.Item>
            {product.description && (
              <Descriptions.Item label="Mô tả"><Paragraph>{product.description}</Paragraph></Descriptions.Item>
            )}
          </Descriptions>

          <Row gutter={12} align="middle" style={{ marginBottom: 16 }}>
            <Col><Text>Số lượng:</Text></Col>
            <Col>
              <InputNumber min={1} max={stock || 99} value={quantity} onChange={setQuantity} />
            </Col>
          </Row>

          <Row gutter={12}>
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                disabled={stock === 0}
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </Button>
            </Col>
            {stock === 0 && (
              <Col>
                <Button size="large" icon={<BookOutlined />} onClick={() => navigate('/reservation', { state: { product } })}>
                  Đặt cọc giữ chỗ
                </Button>
              </Col>
            )}
          </Row>
        </Col>
      </Row>

      <Divider />

      {/* Reviews */}
      <Title level={4}>⭐ Đánh giá sản phẩm ({reviews.length})</Title>
      <List
        dataSource={reviews}
        renderItem={(review) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar>{review.user?.username?.[0]?.toUpperCase() || 'U'}</Avatar>}
              title={<><b>{review.user?.username || 'Khách'}</b> <Rate disabled defaultValue={review.rating} style={{ fontSize: 12 }} /></>}
              description={<><div>{review.comment}</div><Text type="secondary" style={{ fontSize: 12 }}>{formatDate(review.createdAt)}</Text></>}
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Chưa có đánh giá nào' }}
      />

      {user && (
        <Card title="Viết đánh giá" style={{ marginTop: 16 }}>
          <Form form={reviewForm} onFinish={handleReview} layout="vertical">
            <Form.Item name="rating" label="Đánh giá" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
              <Rate />
            </Form.Item>
            <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}>
              <Input.TextArea rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
            </Form.Item>
            <Button type="primary" htmlType="submit">Gửi đánh giá</Button>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ProductDetailPage;
