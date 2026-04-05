import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Divider, List, Typography, Select, Spin, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import cartApi from '../../api/cartApi';
import orderApi from '../../api/orderApi';
import voucherApi from '../../api/voucherApi';
import productApi from '../../api/productApi';
import { formatCurrency } from '../../utils/helpers';
import { App } from 'antd';

const { Title, Text } = Typography;

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const [cart, setCart] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [vouchers, setVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, prodRes] = await Promise.all([
          cartApi.getCart(),
          productApi.getAll(),
        ]);
        setCart(cartRes);

        const arr = Array.isArray(prodRes) ? prodRes : (prodRes?.products || []);
        const map = {};
        arr.forEach((p) => { map[p._id] = p; });
        setProductMap(map);

        // Tải vouchers công khai
        voucherApi.getPublic().then((res) => setVouchers(Array.isArray(res) ? res : [])).catch(() => {});
      } catch {
        message.error('Không thể tải dữ liệu đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lấy items từ cart (BE dùng field `products`)
  const cartItems = cart?.products || [];

  // Tính subtotal dựa vào price từ productMap
  const subtotal = cartItems.reduce((sum, item) => {
    const pid = item.product?._id || item.product;
    const price = productMap[pid]?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const total = Math.max(0, subtotal - discount);

  const handleCheckVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      const res = await voucherApi.check(voucherCode.trim(), subtotal);
      const disc = res?.discountAmount || res?.discount || res?.discountValue || 0;
      setDiscount(disc);
      message.success(`✅ Áp dụng voucher thành công! Giảm ${formatCurrency(disc)}`);
    } catch (err) {
      setDiscount(0);
      message.error(err?.message || 'Mã voucher không hợp lệ hoặc không đủ điều kiện');
    }
  };

  const onFinish = async (values) => {
    if (cartItems.length === 0) { message.warning('Giỏ hàng trống!'); return; }
    setSubmitting(true);
    try {
      // Build items array theo đúng format BE cần:
      // items: [{ product, quantity, price, subtotal }]
      const orderItems = cartItems.map((item) => {
        const pid = item.product?._id || item.product;
        const price = productMap[pid]?.price || 0;
        return {
          product: pid,
          quantity: item.quantity,
          price: price,              // ← BE schema yêu cầu trường này
          subtotal: price * item.quantity,
        };
      });

      const orderPayload = {
        items: orderItems,
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
          city: values.city,
        },
        note: values.note || '',
        voucherCode: voucherCode.trim() || undefined,
      };

      await orderApi.create(orderPayload);
      message.success('🎉 Đặt hàng thành công!');
      navigate('/orders');
    } catch (err) {
      const errMsg = err?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra tồn kho.';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div className="page-container">
      <Title level={3}>📦 Thanh toán đơn hàng</Title>
      <Row gutter={24}>
        {/* Form giao hàng */}
        <Col xs={24} md={14}>
          <Card title="Thông tin giao hàng">
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                <Input placeholder="0901234567" />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                <Input placeholder="123 Đường ABC, Phường X" />
              </Form.Item>
              <Form.Item name="city" label="Thành phố" rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}>
                <Input placeholder="Hồ Chí Minh" />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={2} placeholder="Ghi chú cho người giao hàng..." />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
                🛒 Xác nhận đặt hàng
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Tóm tắt đơn */}
        <Col xs={24} md={10}>
          <Card title={`Đơn hàng (${cartItems.length} sản phẩm)`}>
            <List
              size="small"
              dataSource={cartItems}
              renderItem={(item) => {
                const pid = item.product?._id || item.product;
                const prod = productMap[pid] || {};
                return (
                  <List.Item>
                    <span>{prod.title || 'Sản phẩm'} x{item.quantity}</span>
                    <span>{formatCurrency((prod.price || 0) * item.quantity)}</span>
                  </List.Item>
                );
              }}
            />
            <Divider />

            {/* Voucher */}
            <div style={{ marginBottom: 12 }}>
              <Text strong>Mã giảm giá:</Text>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <Input
                  placeholder="Nhập mã voucher"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                />
                <Button onClick={handleCheckVoucher}>Áp dụng</Button>
              </div>
              {vouchers.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {vouchers.slice(0, 3).map((v) => (
                    <Tag
                      key={v._id} color="orange"
                      style={{ cursor: 'pointer', marginBottom: 4 }}
                      onClick={() => setVoucherCode(v.code)}
                    >
                      {v.code}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            <Divider />
            <Row justify="space-between"><Col>Tạm tính:</Col><Col>{formatCurrency(subtotal)}</Col></Row>
            {discount > 0 && (
              <Row justify="space-between">
                <Col>Giảm giá ({voucherCode}):</Col>
                <Col><Text type="success">-{formatCurrency(discount)}</Text></Col>
              </Row>
            )}
            <Row justify="space-between" style={{ marginTop: 8 }}>
              <Col><Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text></Col>
              <Col><Text strong type="danger" style={{ fontSize: 16 }}>{formatCurrency(total)}</Text></Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;
