import { useEffect, useState } from 'react';
import { Table, Tag, Select, Typography, Modal, Descriptions, List, Button } from 'antd';
import orderApi from '../../api/orderApi';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import { App } from 'antd';

const { Title, Text } = Typography;

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const { message } = App.useApp();

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll();
      setOrders(Array.isArray(res) ? res : (res?.orders || []));
    } catch { message.error('Không thể tải đơn hàng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleChangeStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, { status });
      message.success(`Đã cập nhật trạng thái thành "${getOrderStatusLabel(status)}"`);
      if (status === 'cancelled') message.info('Tồn kho đã được tự động hoàn lại');
      fetchOrders();
    } catch (err) { message.error(err?.message || 'Cập nhật thất bại'); }
  };

  const filtered = filterStatus ? orders.filter((o) => o.status === filterStatus) : orders;

  const columns = [
    { title: 'Mã đơn', dataIndex: '_id', key: '_id', render: (id) => <Text code>{id?.slice(-8)}</Text> },
    { title: 'Khách hàng', key: 'user', render: (_, o) => o.user?.username || o.shippingAddress?.fullName || '—' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total', render: (v) => <Text type="danger" strong>{formatCurrency(v)}</Text> },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={(val) => handleChangeStatus(record._id, val)}
        >
          <Select.Option value="pending"><Tag color="gold">Chờ xử lý</Tag></Select.Option>
          <Select.Option value="delivered"><Tag color="green">Đã giao</Tag></Select.Option>
          <Select.Option value="cancelled"><Tag color="red">Hủy đơn</Tag></Select.Option>
        </Select>
      ),
    },
    { title: 'Ngày đặt', dataIndex: 'createdAt', key: 'createdAt', render: (d) => formatDate(d) },
    { title: 'Chi tiết', key: 'detail', render: (_, r) => <a onClick={() => setSelected(r)}>Xem</a> },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>📋 Quản lý đơn hàng</Title>
        <Select allowClear placeholder="Lọc theo trạng thái" style={{ width: 200 }} onChange={setFilterStatus}>
          <Select.Option value="pending">Chờ xử lý</Select.Option>
          <Select.Option value="delivered">Đã giao</Select.Option>
          <Select.Option value="cancelled">Đã hủy</Select.Option>
        </Select>
      </div>
      <Table columns={columns} dataSource={filtered} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal title={`Đơn hàng #${selected?._id?.slice(-8)}`} open={!!selected} onCancel={() => setSelected(null)} footer={null} width={600}>
        {selected && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Người nhận" span={2}>{selected.shippingAddress?.fullName}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{selected.shippingAddress?.phone}</Descriptions.Item>
              <Descriptions.Item label="Thành phố">{selected.shippingAddress?.city}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{selected.shippingAddress?.address}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}><Text type="danger" strong>{formatCurrency(selected.totalAmount)}</Text></Descriptions.Item>
            </Descriptions>
            <Title level={5} style={{ marginTop: 12 }}>Sản phẩm:</Title>
            <List size="small" dataSource={selected.items || []} renderItem={(item) => (
              <List.Item><span>{item.product?.title} x{item.quantity}</span><span>{formatCurrency(item.subtotal || 0)}</span></List.Item>
            )} />
          </>
        )}
      </Modal>
    </>
  );
};

export default OrderManagementPage;
