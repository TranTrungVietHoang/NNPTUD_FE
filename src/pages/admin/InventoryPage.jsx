import { useEffect, useState } from 'react';
import { Table, Button, Tag, Typography, Spin, Progress, Modal, InputNumber, Form } from 'antd';
import { WarningOutlined, EditOutlined } from '@ant-design/icons';
import inventoryApi from '../../api/inventoryApi';
import axiosClient from '../../api/axiosClient';
import { App } from 'antd';

const { Title } = Typography;

const InventoryPage = () => {
  const [inventories, setInventories] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInv, setEditingInv] = useState(null); // inventory đang sửa
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, lowRes] = await Promise.all([
        inventoryApi.getAll(),
        inventoryApi.getLowStock().catch(() => []),
      ]);
      setInventories(Array.isArray(allRes) ? allRes : (allRes?.inventories || []));
      setLowStock(Array.isArray(lowRes) ? lowRes : (lowRes?.inventories || []));
    } catch {
      message.error('Không thể tải dữ liệu tồn kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (inv) => {
    setEditingInv(inv);
    form.setFieldsValue({ stock: inv.stock });
  };

  const handleUpdateStock = async (values) => {
    try {
      // PUT /api/v1/inventories/:id với body { stock: N }
      await axiosClient.put(`/inventories/${editingInv._id}`, { stock: values.stock });
      message.success(`✅ Đã cập nhật tồn kho thành ${values.stock} sản phẩm!`);
      setEditingInv(null);
      fetchData();
    } catch (err) {
      message.error(err?.message || 'Cập nhật tồn kho thất bại');
    }
  };

  const lowStockIds = new Set(lowStock.map((i) => i._id));

  const columns = [
    {
      title: 'Sản phẩm', key: 'product',
      render: (_, inv) => inv.product?.title || `ID: ${inv.product}`,
    },
    {
      title: 'Tồn kho', dataIndex: 'stock', key: 'stock', width: 200,
      render: (stock) => (
        <div style={{ minWidth: 140 }}>
          <Tag color={stock === 0 ? 'red' : stock < 5 ? 'orange' : 'green'}>
            {stock} sản phẩm
          </Tag>
          <Progress
            percent={Math.min(stock * 5, 100)}
            showInfo={false}
            strokeColor={stock === 0 ? '#f5222d' : stock < 5 ? '#fa8c16' : '#52c41a'}
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'Đã bán', dataIndex: 'soldCount', key: 'soldCount',
      render: (v) => <Tag color="blue">{v || 0} đã bán</Tag>,
    },
    {
      title: 'Trạng thái', key: 'status',
      render: (_, inv) => {
        if (inv.stock === 0) return <Tag color="red">Hết hàng</Tag>;
        if (lowStockIds.has(inv._id)) return <Tag color="orange" icon={<WarningOutlined />}>Sắp hết</Tag>;
        return <Tag color="green">Đủ hàng</Tag>;
      },
    },
    {
      title: 'Cập nhật kho', key: 'action',
      render: (_, inv) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => openEdit(inv)}
        >
          Cập nhật số lượng
        </Button>
      ),
    },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <>
      <Title level={3}>📊 Quản lý tồn kho</Title>

      {lowStock.length > 0 && (
        <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <WarningOutlined style={{ color: '#f5222d', marginRight: 8 }} />
          <strong>Cảnh báo:</strong> Có {lowStock.length} sản phẩm sắp hết hàng (tồn kho &lt; 5)
        </div>
      )}

      <Table
        columns={columns}
        dataSource={inventories}
        rowKey="_id"
        pagination={{ pageSize: 15 }}
        rowClassName={(record) => record.stock === 0 ? '' : ''}
      />

      {/* Modal cập nhật số lượng kho */}
      <Modal
        title={`Cập nhật tồn kho: ${editingInv?.product?.title || ''}`}
        open={!!editingInv}
        onCancel={() => setEditingInv(null)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateStock} layout="vertical">
          <Form.Item
            name="stock"
            label="Số lượng tồn kho mới"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              size="large"
              placeholder="Nhập số lượng..."
            />
          </Form.Item>
          <div style={{ color: '#888', marginBottom: 12 }}>
            Tồn kho hiện tại: <strong>{editingInv?.stock}</strong> sản phẩm
          </div>
          <Button type="primary" htmlType="submit" block size="large">
            Xác nhận cập nhật
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default InventoryPage;
