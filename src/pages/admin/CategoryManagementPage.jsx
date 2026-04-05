import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Typography, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import categoryApi from '../../api/categoryApi';
import { App } from 'antd';

const { Title } = Typography;

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(Array.isArray(res) ? res : (res?.categories || []));
    } catch { message.error('Không thể tải danh mục'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); form.setFieldsValue(cat); setModalOpen(true); };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await categoryApi.update(editing._id, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        await categoryApi.create(values);
        message.success('Tạo danh mục thành công');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) { message.error(err?.message || 'Thất bại'); }
  };

  const handleDelete = async (id) => {
    try {
      await categoryApi.delete(id);
      message.success('Đã xóa danh mục');
      fetchCategories();
    } catch (err) { message.error(err?.message || 'Xóa thất bại'); }
  };

  const columns = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    {
      title: 'Hành động', key: 'action',
      render: (_, cat) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(cat)}>Sửa</Button>
          <Popconfirm title="Xóa danh mục này?" onConfirm={() => handleDelete(cat._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>📂 Quản lý danh mục</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm danh mục</Button>
      </div>
      <Table columns={columns} dataSource={categories} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}><Input /></Form.Item>
          <Button type="primary" htmlType="submit" block>{editing ? 'Cập nhật' : 'Tạo mới'}</Button>
        </Form>
      </Modal>
    </>
  );
};

export default CategoryManagementPage;
