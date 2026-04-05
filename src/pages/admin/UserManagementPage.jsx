import { useEffect, useState } from 'react';
import { Table, Tag, Button, Select, Typography, Modal } from 'antd';
import userApi from '../../api/userApi';
import roleApi from '../../api/roleApi';
import { formatDate } from '../../utils/helpers';
import { App } from 'antd';

const { Title } = Typography;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  const fetchUsers = async () => {
    try {
      const [userRes, roleRes] = await Promise.all([userApi.getAll(), roleApi.getAll().catch(() => [])]);
      setUsers(Array.isArray(userRes) ? userRes : (userRes?.users || []));
      setRoles(Array.isArray(roleRes) ? roleRes : (roleRes?.roles || []));
    } catch {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChangeRole = async (userId, roleId) => {
    try {
      await userApi.update(userId, { role: roleId });
      message.success('Cập nhật quyền thành công');
      fetchUsers();
    } catch (err) {
      message.error(err?.message || 'Cập nhật thất bại');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userApi.update(user._id, { status: !user.status });
      message.success(`Đã ${!user.status ? 'khóa' : 'kích hoạt'} tài khoản`);
      fetchUsers();
    } catch (err) {
      message.error(err?.message || 'Thất bại');
    }
  };

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (v) => <Tag color={v === false ? 'green' : 'red'}>{v === false ? 'Hoạt động' : 'Đã khóa'}</Tag>,
    },
    {
      title: 'Quyền', key: 'role',
      render: (_, user) => (
        <Select
          value={user.role?._id || user.role}
          style={{ width: 150 }}
          onChange={(val) => handleChangeRole(user._id, val)}
        >
          {roles.map((r) => <Select.Option key={r._id} value={r._id}>{r.name}</Select.Option>)}
        </Select>
      ),
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (d) => formatDate(d) },
    {
      title: 'Hành động', key: 'action',
      render: (_, user) => (
        <Button danger={user.status === false} onClick={() => handleToggleActive(user)} size="small">
          {user.status === false ? 'Khóa' : 'Mở khóa'}
        </Button>
      ),
    },
  ];

  return (
    <>
      <Title level={3}>👥 Quản lý người dùng</Title>
      <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
    </>
  );
};

export default UserManagementPage;
