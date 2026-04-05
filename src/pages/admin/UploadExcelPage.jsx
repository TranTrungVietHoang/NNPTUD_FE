import { useState } from 'react';
import { Button, Card, Typography, Result, Alert } from 'antd';
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import uploadApi from '../../api/uploadApi';
import { App } from 'antd';

const { Title, Text, Paragraph } = Typography;

const UploadExcelPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { message } = App.useApp();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && !f.name.endsWith('.xlsx')) {
      message.error('Vui lòng chọn file .xlsx');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) { message.warning('Vui lòng chọn file Excel (.xlsx)'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadApi.uploadExcel(fd);
      setResult(res);
      message.success('Import Excel thành công!');
    } catch (err) {
      message.error(err?.message || 'Import thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={3}>📊 Import sản phẩm từ Excel</Title>
      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message="Hướng dẫn"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Upload file <strong>.xlsx</strong> chứa danh sách sản phẩm</li>
            <li>Hệ thống sẽ tự động tạo sản phẩm và kho hàng (stock = 0) cho từng sản phẩm</li>
            <li>Có thể import hàng nghìn sản phẩm trong vài giây</li>
          </ul>
        }
      />

      <Card style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px', border: '2px dashed #d9d9d9', borderRadius: 8, cursor: 'pointer', textAlign: 'center' }}>
            <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            <div>
              <Text strong>Chọn file Excel</Text>
              <br />
              <Text type="secondary">Chỉ hỗ trợ định dạng .xlsx</Text>
            </div>
            <input type="file" accept=".xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
            {file && <Text type="success">✅ {file.name}</Text>}
          </label>
        </div>

        <Button
          type="primary"
          icon={<UploadOutlined />}
          size="large"
          block
          loading={loading}
          disabled={!file}
          onClick={handleUpload}
        >
          {loading ? 'Đang import...' : 'Bắt đầu Import'}
        </Button>
      </Card>

      {result && (
        <Result
          status="success"
          title="Import thành công!"
          subTitle={`Đã tạo ${result.count || result.inserted || '?'} sản phẩm từ file Excel.`}
          style={{ marginTop: 24 }}
        />
      )}
    </>
  );
};

export default UploadExcelPage;
