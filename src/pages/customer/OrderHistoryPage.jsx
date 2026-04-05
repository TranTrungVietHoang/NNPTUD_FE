import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Spin, Descriptions, Modal, List } from 'antd';
import orderApi from '../../api/orderApi';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import { App } from 'antd';

const { Title, Text } = Typography;

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { message } = App.useApp();

  useEffect(() => {
    orderApi.getAll()
      .then((res) => setOrders(Array.isArray(res) ? res : (res?.orders || [])))
      .catch(() => message.error('Không thể tải đơn hàng'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'Mã đơn', dataIndex: '_id', key: '_id', render: (id) => <Text code>{id?.slice(-8)}</Text> },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status) => <Tag color={getOrderStatusColor(status)}>{getOrderStatusLabel(status)}</Tag>,
    },
    {
      title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total',
      render: (v) => <Text type="danger" strong>{formatCurrency(v)}</Text>,
    },
    { title: 'Ngày đặt', dataIndex: 'createdAt', key: 'createdAt', render: (d) => formatDate(d) },
    {
      title: 'Chi tiết', key: 'action',
      render: (_, record) => <a onClick={() => setSelected(record)}>Xem chi tiết</a>,
    },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div className="page-container">
      <Title level={3}>📋 Lịch sử đơn hàng</Title>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Bạn chưa có đơn hàng nào' }}
      />

      <Modal
        title={`Chi tiết đơn hàng #${selected?._id?.slice(-8)}`}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={600}
      >
        {selected && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getOrderStatusColor(selected.status)}>{getOrderStatusLabel(selected.status)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền"><Text type="danger" strong>{formatCurrency(selected.totalAmount)}</Text></Descriptions.Item>
              <Descriptions.Item label="Người nhận" span={2}>{selected.shippingAddress?.fullName}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{selected.shippingAddress?.phone}</Descriptions.Item>
              <Descriptions.Item label="Thành phố">{selected.shippingAddress?.city}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{selected.shippingAddress?.address}</Descriptions.Item>
              {selected.voucherCode && <Descriptions.Item label="Voucher">{selected.voucherCode}</Descriptions.Item>}
            </Descriptions>
            <Title level={5} style={{ marginTop: 16 }}>Sản phẩm đã đặt:</Title>
            <List
              size="small"
              dataSource={selected.items || []}
              renderItem={(item) => (
                <List.Item>
                  <span>{item.product?.title || 'Sản phẩm'} x{item.quantity}</span>
                  <span>{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistoryPage;
