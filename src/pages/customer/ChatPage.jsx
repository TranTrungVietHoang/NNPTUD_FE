import { useEffect, useState, useRef } from 'react';
import { Input, Button, List, Avatar, Typography, Card, Spin, Select } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import messageApi from '../../api/messageApi';
import userApi from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/helpers';
import { App } from 'antd';

const { Title, Text } = Typography;

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const messagesEndRef = useRef(null);
  const { message: appMessage } = App.useApp();

  useEffect(() => {
    userApi.getAdmins()
      .then((res) => {
        const adminUsers = Array.isArray(res) ? res : (res?.data || []);
        setAdmins(adminUsers);
        if (adminUsers.length > 0) setSelectedAdmin(adminUsers[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedAdmin) return;
    setLoading(true);
    messageApi.getHistory(selectedAdmin)
      .then((res) => setMessages(Array.isArray(res) ? res : (res?.data || res?.messages || [])))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [selectedAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedAdmin) return;
    try {
      await messageApi.send({
        to: selectedAdmin,
        type: 'text',
        text: text.trim(),
      });
      setText('');
      const res = await messageApi.getHistory(selectedAdmin);
      setMessages(Array.isArray(res) ? res : (res?.data || res?.messages || []));
    } catch (err) {
      appMessage.error(err?.message || 'Gửi tin nhắn thất bại');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
      <Title level={3}>💬 Chat hỗ trợ</Title>

      {admins.length > 1 && (
        <Select value={selectedAdmin} onChange={setSelectedAdmin} style={{ marginBottom: 12, width: '100%' }}>
          {admins.map((a) => <Select.Option key={a._id} value={a._id}>{a.username} (Admin)</Select.Option>)}
        </Select>
      )}

      <Card style={{ height: 450, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} bodyStyle={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {loading ? <Spin style={{ margin: 'auto' }} /> : (
          <>
            {messages.length === 0 && <div style={{ textAlign: 'center', color: '#aaa', marginTop: 80 }}>Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên!</div>}
            {messages.map((msg, i) => {
              const isMine = (msg.from?._id || msg.from) === user?._id;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                  {!isMine && <Avatar icon={<UserOutlined />} style={{ marginRight: 8, backgroundColor: '#1677ff' }} />}
                  <div style={{
                    background: isMine ? '#1677ff' : '#f0f0f0',
                    color: isMine ? '#fff' : '#000',
                    padding: '8px 14px',
                    borderRadius: 16,
                    maxWidth: '70%',
                  }}>
                    <div>{msg.messageContent?.text || msg.text || msg.content}</div>
                    <Text style={{ fontSize: 10, opacity: 0.7, color: isMine ? '#ddd' : '#888' }}>{formatDate(msg.createdAt)}</Text>
                  </div>
                  {isMine && <Avatar style={{ marginLeft: 8, backgroundColor: '#52c41a' }}>{user?.username?.[0]?.toUpperCase()}</Avatar>}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Card>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onPressEnter={handleSend}
          size="large"
        />
        <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleSend} disabled={!text.trim()}>
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
