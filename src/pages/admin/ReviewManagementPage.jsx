import { useEffect, useState } from 'react';
import { Table, Tag, Button, Typography, Space, Popconfirm, Rate } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, DeleteOutlined } from '@ant-design/icons';
import reviewApi from '../../api/reviewApi';
import { App } from 'antd';
import { formatDate } from '../../utils/helpers';

const { Title, Text } = Typography;

const ReviewManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getAll();
      setReviews(Array.isArray(res) ? res : (res?.data || []));
    } catch {
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleVisibility = async (id) => {
    try {
      await reviewApi.toggleVisibility(id);
      message.success('Cập nhật trạng thái hiển thị thành công');
      fetchReviews();
    } catch (err) {
      message.error('Thất bại');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      render: (u) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{u?.username || 'N/A'}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{u?.email}</div>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (p) => p?.title || 'N/A',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (r) => <Rate disabled defaultValue={r} style={{ fontSize: 14 }} />,
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
    {
       title: 'Trạng thái',
       dataIndex: 'isHidden',
       key: 'isHidden',
       render: (hidden) => (
         <Tag color={hidden ? 'red' : 'green'}>
           {hidden ? 'Đang ẩn' : 'Đang hiện'}
         </Tag>
       )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDate(d),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={record.isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
            onClick={() => handleToggleVisibility(record._id)}
            title={record.isHidden ? 'Hiện đánh giá' : 'Ẩn đánh giá'}
          >
            {record.isHidden ? 'Hiện' : 'Ẩn'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Title level={3}>⭐ Quản lý đánh giá sản phẩm</Title>
      <Table 
        columns={columns} 
        dataSource={reviews} 
        rowKey="_id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ReviewManagementPage;
