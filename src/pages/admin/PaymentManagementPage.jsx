import { useEffect, useState } from 'react';
import { Table, Tag, Button, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import paymentApi from '../../api/paymentApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { App } from 'antd';

const { Title, Text } = Typography;

const PaymentManagementPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  const fetchPayments = async () => {
    // payments list endpoint – try common paths
    try {
      const axiosClient = (await import('../../api/axiosClient')).default;
      const res = await axiosClient.get('/payments');
      setPayments(Array.isArray(res) ? res : (res?.payments || []));
    } catch {
      message.warning('Không có dữ liệu thanh toán hoặc API chưa hỗ trợ GET /payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleApprove = async (id) => {
    try {
      await paymentApi.approve(id);
      message.success('Đã duyệt thanh toán thành công');
      fetchPayments();
    } catch (err) {
      message.error(err?.message || 'Duyệt thất bại');
    }
  };

  const columns = [
    { title: 'Mã đơn hàng', dataIndex: ['order', '_id'], key: 'order', render: (v, r) => <Text code>{(v || r.order)?.slice?.(-8) || '—'}</Text> },
    { title: 'Phương thức', dataIndex: 'paymentMethod', key: 'method' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v) => <Text type="danger" strong>{formatCurrency(v)}</Text> },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (v) => <Tag color={v === 'paid' ? 'green' : 'orange'}>{v === 'paid' ? 'Đã thanh toán' : 'Chờ duyệt'}</Tag>,
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (d) => formatDate(d) },
    {
      title: 'Hành động', key: 'action',
      render: (_, record) => record.status !== 'paid' ? (
        <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApprove(record._id)}>
          Duyệt thanh toán
        </Button>
      ) : <Tag color="green">✅ Đã duyệt</Tag>,
    },
  ];

  return (
    <>
      <Title level={3}>💳 Quản lý thanh toán</Title>
      <Table columns={columns} dataSource={payments} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Chưa có bản ghi thanh toán' }} />
    </>
  );
};

export default PaymentManagementPage;
