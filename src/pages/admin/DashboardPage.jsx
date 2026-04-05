import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import { ShoppingOutlined, UserOutlined, AppstoreOutlined, WarningOutlined } from '@ant-design/icons';
import productApi from '../../api/productApi';
import userApi from '../../api/userApi';
import orderApi from '../../api/orderApi';
import inventoryApi from '../../api/inventoryApi';
import { App } from 'antd';

const { Title } = Typography;

const DashboardPage = () => {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, userRes, orderRes, lowRes] = await Promise.all([
          productApi.getAll(),
          userApi.getAll().catch(() => []),
          orderApi.getAll().catch(() => []),
          inventoryApi.getLowStock().catch(() => []),
        ]);
        const products = Array.isArray(prodRes) ? prodRes : (prodRes?.products || []);
        const users = Array.isArray(userRes) ? userRes : (userRes?.users || []);
        const orders = Array.isArray(orderRes) ? orderRes : (orderRes?.orders || []);
        const low = Array.isArray(lowRes) ? lowRes : (lowRes?.inventories || []);
        setStats({ products: products.length, users: users.length, orders: orders.length });
        setLowStock(low);
      } catch {
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const lowStockColumns = [
    { title: 'Sản phẩm', dataIndex: ['product', 'title'], key: 'title', render: (v, r) => v || r.productTitle || 'N/A' },
    { title: 'Tồn kho', dataIndex: 'stock', key: 'stock', render: (v) => <Tag color={v === 0 ? 'red' : 'orange'}>{v} sản phẩm</Tag> },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <>
      <Title level={3}>📊 Dashboard</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Tổng sản phẩm" value={stats.products} prefix={<ShoppingOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Tổng người dùng" value={stats.users} prefix={<UserOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Tổng đơn hàng" value={stats.orders} prefix={<AppstoreOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
      </Row>

      <Card title={<span><WarningOutlined style={{ color: '#f5222d', marginRight: 8 }} />Sản phẩm sắp hết hàng (tồn kho &lt; 5)</span>}>
        <Table
          columns={lowStockColumns}
          dataSource={lowStock}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: '✅ Tất cả sản phẩm có đủ hàng tồn kho' }}
          size="small"
        />
      </Card>
    </>
  );
};

export default DashboardPage;
