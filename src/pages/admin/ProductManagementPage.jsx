import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Typography, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import inventoryApi from '../../api/inventoryApi';
import axiosClient from '../../api/axiosClient';
import { formatCurrency } from '../../utils/helpers';
import { App } from 'antd';

const { Title } = Typography;
const BE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

// Hàm lấy URL ảnh từ product.images (có thể là local path hoặc URL đầy đủ)
const getImageUrl = (images) => {
  if (!images || images.length === 0) return null;
  const img = Array.isArray(images) ? images[0] : images;
  if (!img) return null;
  if (img.startsWith('http')) return img;
  // Local path từ BE uploads folder
  return `${BE_URL}/uploads/${img.split('/').pop()}`;
};

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = tạo mới, object = chỉnh sửa
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([productApi.getAll(), categoryApi.getAll()]);
      setProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.products || []));
      setCategories(Array.isArray(catRes) ? catRes : (catRes?.categories || []));
    } catch { message.error('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setPreviewImage('');
    setSelectedFile(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setPreviewImage(getImageUrl(product.images) || '');
    setSelectedFile(null);
    form.setFieldsValue({
      title: product.title,
      price: product.price,
      category: product.category?._id || product.category,
      description: product.description,
    });
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (values) => {
    setUploading(true);
    try {
      let imageUrl = previewImage;

      // Upload ảnh mới nếu có
      if (selectedFile) {
        const fd = new FormData();
        fd.append('file', selectedFile); // BE dùng field 'file'
        try {
          const token = localStorage.getItem('token');
          const uploadRes = await fetch(`${BE_URL}/api/v1/upload/an_image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd
          }).then(res => {
            if (!res.ok) throw new Error('Upload error from server');
            return res.json();
          });
          const pathRes = uploadRes?.path || uploadRes?.filename || '';
          // Ảnh từ Cloudinary sẽ có dạng https://..., nếu local sẽ trả file name
          imageUrl = pathRes.startsWith('http') ? pathRes : (pathRes ? `${BE_URL}/uploads/${pathRes.split(/[\\/]/).pop()}` : '');
        } catch (uploadErr) {
          console.error("Upload Error:", uploadErr);
          message.warning('Upload ảnh thất bại, sản phẩm sẽ không có ảnh mới');
          imageUrl = '';
        }
      }

      const payload = {
        title: values.title,
        price: values.price,
        category: values.category,
        description: values.description || '',
        images: imageUrl ? [imageUrl] : (editingProduct?.images || []),
      };

      if (editingProduct) {
        await axiosClient.put(`/products/${editingProduct._id}`, payload);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await productApi.create(payload);
        message.success('Tạo sản phẩm thành công! Tồn kho mặc định = 0.');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      const errMsg = err?.message || '';
      if (errMsg.includes('E11000') || errMsg.includes('duplicate key')) {
        message.error('Tên sản phẩm này đã tồn tại! Vui lòng chọn tên khác.');
      } else {
        message.error(errMsg || 'Thao tác thất bại');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/products/${id}`);
      message.success('Đã xóa sản phẩm (soft delete)');
      fetchData();
    } catch (err) { message.error(err?.message || 'Xóa thất bại'); }
  };

  const columns = [
    {
      title: 'Ảnh', key: 'image', width: 80,
      render: (_, product) => {
        const url = getImageUrl(product.images);
        return url
          ? <img src={url} alt="" style={{ width: 55, height: 55, objectFit: 'cover', borderRadius: 6 }} />
          : <span style={{ color: '#ccc' }}>—</span>;
      },
    },
    { title: 'Tên sản phẩm', dataIndex: 'title', key: 'title' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v) => <Tag>{v}</Tag> },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (v) => <Tag color="red">{formatCurrency(v)}</Tag> },
    { title: 'Danh mục', dataIndex: ['category', 'name'], key: 'category', render: (v) => v || '—' },
    {
      title: 'Hành động', key: 'action',
      render: (_, product) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(product)}>Sửa</Button>
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(product._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>📦 Quản lý sản phẩm</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm sản phẩm</Button>
      </div>

      <Table columns={columns} dataSource={products} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={editingProduct ? `Sửa: ${editingProduct.title}` : 'Tạo sản phẩm mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="title" label="Tên sản phẩm" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá (VND)" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Select placeholder="Chọn danh mục">
              {categories.map((c) => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Hình ảnh sản phẩm">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {previewImage && (
              <img src={previewImage} alt="preview" style={{ width: '100%', marginTop: 8, borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />
            )}
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={uploading}>
            {editingProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default ProductManagementPage;
