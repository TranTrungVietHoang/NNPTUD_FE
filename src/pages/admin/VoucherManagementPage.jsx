import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Typography, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import voucherApi from '../../api/voucherApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { App } from 'antd';

const { Title } = Typography;

const VoucherManagementPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetchVouchers = async () => {
    try {
      const res = await voucherApi.getAdmin();
      setVouchers(Array.isArray(res) ? res : (res?.vouchers || []));
    } catch {
      // fallback to public
      voucherApi.getPublic().then((r) => setVouchers(Array.isArray(r) ? r : [])).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleCreate = async (values) => {
    try {
      await voucherApi.create({ ...values, endDate: values.endDate?.toISOString() });
      message.success('Tạo voucher thành công!');
      setModalOpen(false);
      form.resetFields();
      fetchVouchers();
    } catch (err) { message.error(err?.message || 'Tạo voucher thất bại'); }
  };

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', render: (v) => <Tag color="orange" style={{ fontSize: 14 }}>{v}</Tag> },
    {
      title: 'Loại giảm', dataIndex: 'discountType', key: 'discountType',
      render: (v) => <Tag>{v === 'fixed' ? 'Giảm số tiền' : 'Giảm %'}</Tag>,
    },
    {
      title: 'Giá trị', key: 'discountValue',
      render: (_, v) => v.discountType === 'fixed' ? formatCurrency(v.discountValue) : `${v.discountValue}%`,
    },
    { title: 'Ngày hết hạn', dataIndex: 'endDate', key: 'endDate', render: (d) => formatDate(d) },
    {
      title: 'Trạng thái', key: 'status',
      render: (_, v) => {
        const expired = new Date(v.endDate) < new Date();
        return <Tag color={expired ? 'red' : 'green'}>{expired ? 'Hết hạn' : 'Còn hiệu lực'}</Tag>;
      },
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>🎫 Quản lý Voucher</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>Tạo Voucher</Button>
      </div>
      <Table columns={columns} dataSource={vouchers} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal title="Tạo Voucher mới" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="code" label="Mã Voucher" rules={[{ required: true }]}><Input placeholder="GIAM50" style={{ textTransform: 'uppercase' }} /></Form.Item>
          <Form.Item name="discountType" label="Loại giảm" rules={[{ required: true }]}>
            <Select><Select.Option value="fixed">Giảm số tiền cố định</Select.Option><Select.Option value="percent">Giảm theo %</Select.Option></Select>
          </Form.Item>
          <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="minOrderAmount" label="Đơn tối thiểu (VND)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày hết hạn" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Tạo Voucher</Button>
        </Form>
      </Modal>
    </>
  );
};

export default VoucherManagementPage;
