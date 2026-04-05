import { useEffect, useState } from 'react';
import { List, Button, Badge, Typography, Empty, Card, Tag, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import notificationApi from '../../api/notificationApi';
import { formatDate } from '../../utils/helpers';
import { App } from 'antd';

const { Title, Text } = Typography;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(Array.isArray(res) ? res : (res?.notifications || []));
    } catch {
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      message.success('Đã đánh dấu tất cả là đã đọc');
      fetchNotifications();
    } catch (err) {
      message.error(err?.message || 'Thất bại');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}><BellOutlined /> Thông báo <Badge count={unreadCount} /></Title>
        {unreadCount > 0 && (
          <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Empty description="Chưa có thông báo nào" />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notif) => (
            <List.Item style={{ background: notif.isRead ? '#fff' : '#e6f4ff', borderRadius: 8, marginBottom: 8, padding: '12px 16px' }}>
              <List.Item.Meta
                avatar={<BellOutlined style={{ fontSize: 20, color: notif.isRead ? '#999' : '#1677ff' }} />}
                title={
                  <span>
                    {notif.title || notif.message}
                    {!notif.isRead && <Tag color="blue" style={{ marginLeft: 8 }}>Mới</Tag>}
                  </span>
                }
                description={
                  <>
                    {notif.body && <Text type="secondary">{notif.body}</Text>}
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(notif.createdAt)}</Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
