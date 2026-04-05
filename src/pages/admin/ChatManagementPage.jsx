import { useEffect, useState, useRef } from 'react';
import { Input, Button, List, Avatar, Typography, Card, Spin, Space, Layout } from 'antd';
import { SendOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import messageApi from '../../api/messageApi';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/helpers';
import { App } from 'antd';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const ChatManagementPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [convoLoading, setConvoLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { message: appMessage } = App.useApp();

  const fetchConversations = async () => {
    try {
      const res = await messageApi.getConversations();
      setConversations(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setConvoLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectUser = (otherUser) => {
    setSelectedUser(otherUser);
  };

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    messageApi.getHistory(selectedUser._id)
      .then((res) => setMessages(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;
    try {
      await messageApi.send({
        to: selectedUser._id,
        type: 'text',
        text: text.trim(),
      });
      setText('');
      // Reload history
      const res = await messageApi.getHistory(selectedUser._id);
      setMessages(Array.isArray(res) ? res : (res?.data || []));
      // Reload conversations layout to show latest message at top
      fetchConversations();
    } catch (err) {
      appMessage.error(err?.message || 'Gửi tin nhắn thất bại');
    }
  };

  return (
    <div className="page-container">
      <Title level={3}>💬 Hỗ trợ khách hàng</Title>
      
      <Layout style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0', height: 'calc(100vh - 180px)' }}>
        {/* SIDEBAR - Danh sách khách hàng */}
        <Sider width={300} style={{ background: '#fafafa', borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
          {convoLoading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> : (
            <List
              dataSource={conversations}
              renderItem={(msg) => {
                const otherUser = (msg.from?._id === user?._id) ? msg.to : msg.from;
                if (!otherUser) return null;
                const isSelected = selectedUser?._id === otherUser._id;
                
                return (
                  <List.Item
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background: isSelected ? '#e6f4ff' : 'transparent',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => handleSelectUser(otherUser)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />}
                      title={<Text strong>{otherUser.username || otherUser.fullName}</Text>}
                      description={
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Text ellipsis style={{ opacity: 0.7, fontSize: 13 }}>
                            {(msg.from?._id === user?._id ? 'Bạn: ' : '')} 
                            {msg.messageContent?.text || msg.text || msg.content}
                          </Text>
                          <Text style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>{formatDate(msg.createdAt)}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
              locale={{ emptyText: 'Chưa có đoạn chat nào' }}
            />
          )}
        </Sider>

        {/* CONTENT - Lịch sử chat */}
        <Content style={{ display: 'flex', flexDirection: 'column', pading: 0, position: 'relative' }}>
          {!selectedUser ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', flexDirection: 'column' }}>
               <MessageOutlined style={{ fontSize: 48, marginBottom: 16 }} />
               <Text>Chọn một khách hàng ở danh sách bên trái để bắt đầu hỗ trợ</Text>
            </div>
          ) : (
            <>
              {/* Header chat box */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', background: '#fff', fontWeight: 'bold' }}>
                 Đang hỗ trợ: {selectedUser.username || selectedUser.fullName}
              </div>

              {/* Chat history */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#fff' }}>
                {loading ? <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }} /> : (
                  <>
                    {messages.length === 0 && <div style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>Khách hàng chưa nhắn tin gì.</div>}
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
              </div>

              {/* Input bar */}
              <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                   <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={`Phản hồi đến ${selectedUser.username}...`}
                      onPressEnter={handleSend}
                      size="large"
                    />
                    <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleSend} disabled={!text.trim()}>
                      Gửi
                    </Button>
                  </div>
              </div>
            </>
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default ChatManagementPage;
