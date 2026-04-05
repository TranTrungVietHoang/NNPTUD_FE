import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authApi.register({ username: values.username, password: values.password, email: values.email });
      messageApi.success('Đăng ký thành công! Vui lòng đăng nhập.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      // BE trả về array lỗi [{field: msg}] hoặc string hoặc object
      if (Array.isArray(err)) {
        const msgs = err.map((e) => Object.values(e)[0]).join(', ');
        messageApi.error(msgs);
      } else {
        const errMsg = typeof err === 'string' ? err : (err?.message || 'Đăng ký thất bại, vui lòng thử lại.');
        messageApi.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      {contextHolder}
      <Card style={{ width: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48 }}>🛒</div>
          <Title level={3} style={{ marginBottom: 4 }}>Tạo tài khoản</Title>
          <Text type="secondary">Tham gia NNPTUD Shop ngay hôm nay</Text>
        </div>

        {/* Gợi ý mật khẩu mạnh */}
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16, fontSize: 12 }}
          message="Yêu cầu mật khẩu"
          description="Tối thiểu 8 ký tự, bao gồm: 1 chữ HOA, 1 chữ thường, 1 số, 1 ký tự đặc biệt. Ví dụ: Admin@123"
        />

        <Form name="register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { pattern: /^[a-zA-Z0-9]+$/, message: 'Chỉ được dùng chữ và số (không dấu, không khoảng trắng)' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="VD: khachhang1" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="VD: email@gmail.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
                  if (!strong) return Promise.reject('Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt');
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="VD: Admin@123" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text>Đã có tài khoản? </Text>
          <Link to="/login">Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
