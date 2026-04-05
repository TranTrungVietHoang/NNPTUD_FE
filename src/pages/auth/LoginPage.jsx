import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../api/authApi';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // BE trả về raw token string hoặc object có .token
      const res = await authApi.login(values);
      
      // Xử lý cả 2 trường hợp: BE trả về string token hoặc object {token, user}
      let tokenStr = null;
      if (typeof res === 'string') {
        tokenStr = res; // BE trả về raw string
      } else if (res?.token) {
        tokenStr = res.token;
      }

      if (!tokenStr) {
        messageApi.error('Đăng nhập thất bại, không nhận được token.');
        return;
      }

      // Tạm lưu token để gọi /auth/me lấy user info
      localStorage.setItem('token', tokenStr);

      // Gọi /auth/me để lấy thông tin user đầy đủ (role, username...)
      let userData = null;
      try {
        userData = await axiosClient.get('/auth/me');
      } catch {
        // Nếu /auth/me không có, dùng dữ liệu cơ bản
        userData = { username: values.username };
      }

      login(tokenStr, userData);
      messageApi.success('Đăng nhập thành công!');

      setTimeout(() => {
        const roleName = userData?.role?.name || userData?.role || '';
        const isStaff = roleName === 'ADMIN' || roleName === 'MODERATOR' || roleName === 'MOD';
        navigate(isStaff ? '/admin' : '/');
      }, 500);

    } catch (err) {
      // Hiển thị lỗi từ BE (string hoặc object)
      const errMsg = typeof err === 'string' ? err : (err?.message || 'Sai tài khoản hoặc mật khẩu.');
      messageApi.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      {contextHolder}
      <Card style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>🛒</div>
          <Title level={3} style={{ marginBottom: 4 }}>NNPTUD Shop</Title>
          <Text type="secondary">Đăng nhập để tiếp tục</Text>
        </div>
        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text>Chưa có tài khoản? </Text>
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
