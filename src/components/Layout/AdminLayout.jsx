import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Button, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  InboxOutlined,
  TagOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TruckOutlined,
  UploadOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  MessageOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const adminMenuItems = [
  { key: '/admin', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/admin/users', label: 'Người dùng', icon: <UserOutlined /> },
  { key: '/admin/chat', label: 'Hỗ trợ Chat', icon: <MessageOutlined /> },
  { key: '/admin/categories', label: 'Danh mục', icon: <AppstoreOutlined /> },
  { key: '/admin/products', label: 'Sản phẩm', icon: <ShoppingOutlined /> },
  { key: '/admin/inventory', label: 'Tồn kho', icon: <InboxOutlined /> },
  { key: '/admin/vouchers', label: 'Voucher', icon: <TagOutlined /> },
  { key: '/admin/orders', label: 'Đơn hàng', icon: <ShoppingCartOutlined /> },
  { key: '/admin/reviews', label: 'Đánh giá', icon: <StarOutlined /> },
  { key: '/admin/payments', label: 'Thanh toán', icon: <DollarOutlined /> },
  { key: '/admin/suppliers', label: 'Nhà cung cấp', icon: <TruckOutlined /> },
  { key: '/admin/upload-excel', label: 'Import Excel', icon: <UploadOutlined /> },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token: themeToken } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'shop', label: 'Xem trang Shop', icon: <HomeOutlined />, onClick: () => navigate('/') },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: themeToken.colorBgContainer }}
        width={220}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: collapsed ? 20 : 16,
            fontWeight: 700,
            color: '#1677ff',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/admin')}
        >
          {collapsed ? '🛒' : '🛒 Admin Panel'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={adminMenuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: themeToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <span>{user?.username} (Admin)</span>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: '16px', padding: '16px', background: themeToken.colorBgContainer, borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
