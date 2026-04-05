import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import supplierApi from '../../api/supplierApi';
import { App } from 'antd';

const { Title } = Typography;

const SupplierManagementPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetchSuppliers = async () => {
    try {
      const res = await supplierApi.getAll();
      setSuppliers(Array.isArray(res) ? res : (res?.suppliers || []));
    } catch { message.error('Không thể tải nhà cung cấp'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleCreate = async (values) => {
    try {
      await supplierApi.create(values);
      message.success('Thêm nhà cung cấp thành công!');
      setModalOpen(false);
      form.resetFields();
      fetchSuppliers();
    } catch (err) { message.error(err?.message || 'Thêm thất bại'); }
  };

  const columns = [
    { title: 'Tên công ty', dataIndex: 'name', key: 'name' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>🚛 Quản lý nhà cung cấp</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          Thêm NCC
        </Button>
      </div>
      <Table columns={columns} dataSource={suppliers} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal title="Thêm nhà cung cấp mới" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Tên công ty" rules={[{ required: true }]}><Input placeholder="Apple VN" /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input placeholder="0901234567" /></Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}><Input placeholder="Q1, HCM" /></Form.Item>
          <Button type="primary" htmlType="submit" block>Thêm nhà cung cấp</Button>
        </Form>
      </Modal>
    </>
  );
};

export default SupplierManagementPage;
