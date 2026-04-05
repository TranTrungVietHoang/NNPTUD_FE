import { useState } from 'react';
import { Card, Form, Input, Button, Tabs, Typography, App, Avatar, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import userApi from '../../api/userApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const { user, login, logout } = useAuth();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      const res = await userApi.updateProfile(values);
      message.success('Cập nhật thông tin thành công!');
      // Update local context
      login(res.token || localStorage.getItem('token'), res.user || res);
    } catch (err) {
      message.error(err?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      return message.error('Mật khẩu xác nhận không khớp');
    }
    setLoading(true);
    try {
      await userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      modal.success({
        title: 'Đổi mật khẩu thành công',
        content: 'Vui lòng đăng nhập lại với mật khẩu mới để đảm bảo an toàn.',
        onOk: () => {
          logout();
          navigate('/login');
        }
      });
    } catch (err) {
      message.error(err?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined />
          Thông tin cá nhân
        </span>
      ),
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={{
            fullName: user?.fullName,
            email: user?.email,
            username: user?.username
          }}
          onFinish={handleUpdateProfile}
        >
          <Form.Item label="Tên đăng nhập" name="username">
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<EditOutlined />} placeholder="Nhập họ và tên của bạn" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập địa chỉ email" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Lưu thay đổi
          </Button>
        </Form>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <LockOutlined />
          Đổi mật khẩu
        </span>
      ),
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu cũ" />
          </Form.Item>
          <Divider />
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận chưa chính xác'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block danger size="large">
            Đổi mật khẩu
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card bordered={false} className="profile-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} src={user?.avatarUrl} style={{ backgroundColor: '#1677ff', marginBottom: 12 }} />
          <Title level={3} style={{ margin: 0 }}>{user?.username}</Title>
          <Text type="secondary">{user?.email}</Text>
        </div>
        <Tabs defaultActiveKey="1" items={tabs} centered />
      </Card>
    </div>
  );
};

export default ProfilePage;
