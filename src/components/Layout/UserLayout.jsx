import { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, Button, Space } from 'antd';
import {
  ShoppingCartOutlined,
  BellOutlined,
  UserOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  MessageOutlined,
  LogoutOutlined,
  LoginOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import notificationApi from '../../api/notificationApi';

const { Header, Content, Footer } = Layout;

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationApi.getAll()
        .then((data) => {
          const list = Array.isArray(data) ? data : (data?.notifications || []);
          setUnreadCount(list.filter((n) => !n.isRead).length);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'orders', label: 'Lịch sử đơn hàng', icon: <HistoryOutlined />, onClick: () => navigate('/orders') },
    { key: 'notifications', label: 'Thông báo', icon: <BellOutlined />, onClick: () => navigate('/notifications') },
    { key: 'chat', label: 'Chat hỗ trợ', icon: <MessageOutlined />, onClick: () => navigate('/chat') },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
  ];

  const navItems = [
    { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
    { key: '/products', label: 'Sản phẩm', icon: <AppstoreOutlined /> },
    { key: '/cart', label: 'Giỏ hàng', icon: <ShoppingCartOutlined /> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529', padding: '0 24px' }}>
        {/* Logo */}
        <div
          style={{ color: '#fff', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          🛒 NNPTUD Shop
        </div>

        {/* Nav Menu */}
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={navItems.map((item) => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
            onClick: () => navigate(item.key),
          }))}
          style={{ flex: 1, marginLeft: 24, borderBottom: 'none' }}
        />

        {/* Right Actions */}
        <Space size={16}>
          {user ? (
            <>
              <Badge count={unreadCount} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined style={{ color: '#fff', fontSize: 18 }} />}
                  onClick={() => navigate('/notifications')}
                />
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer', color: '#fff' }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                  <span>{user.username}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 134px)' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#aaa' }}>
        NNPTUD Shop © {new Date().getFullYear()} — Đồ án môn học
      </Footer>
    </Layout>
  );
};

export default UserLayout;
