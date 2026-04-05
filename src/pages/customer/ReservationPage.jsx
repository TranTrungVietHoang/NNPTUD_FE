import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, InputNumber, DatePicker, Typography, Select } from 'antd';
import { useLocation } from 'react-router-dom';
import productApi from '../../api/productApi';
import reservationApi from '../../api/reservationApi';
import { formatCurrency } from '../../utils/helpers';
import { App } from 'antd';

const { Title, Text } = Typography;

const ReservationPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const { message } = App.useApp();

  const preselectedProduct = location.state?.product;

  useEffect(() => {
    productApi.getAll().then((res) => setProducts(Array.isArray(res) ? res : (res?.products || [])));
    if (preselectedProduct) {
      form.setFieldsValue({ product: preselectedProduct._id });
    }
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await reservationApi.create({
        product: values.product,
        quantity: values.quantity,
        depositAmount: values.depositAmount,
        expectedBuyDate: values.expectedBuyDate?.toISOString(),
      });
      message.success('Đặt cọc thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      form.resetFields();
    } catch (err) {
      message.error(err?.message || 'Đặt cọc thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={3}>📌 Đặt cọc giữ hàng</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Dành cho các sản phẩm đặc biệt/sắp ra mắt. Đặt cọc để giữ chỗ trước khi hàng về.
      </Text>

      <Card>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="product" label="Sản phẩm" rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}>
            <Select placeholder="Chọn sản phẩm muốn đặt cọc" showSearch optionFilterProp="children">
              {products.map((p) => (
                <Select.Option key={p._id} value={p._id}>
                  {p.title} — {formatCurrency(p.price)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]} initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="depositAmount" label="Số tiền cọc (VND)" rules={[{ required: true }]}>
            <InputNumber min={1000} style={{ width: '100%' }} placeholder="500000" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="expectedBuyDate" label="Ngày dự kiến mua" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Xác nhận đặt cọc
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ReservationPage;
