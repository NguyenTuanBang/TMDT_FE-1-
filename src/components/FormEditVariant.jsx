import {
  Form,
  Modal,
  Input,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import api from "../utils/api";

const FormEditVariant = () => {
  const id = "68e10e224aa0bea0f1946013";
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const fetchData = async (id) => {
    const response = await api.get(`/variant/${id}`);
    return response.data;
  };

  useEffect(() => {
    if (open && id) {
      fetchData(id).then((res) => {
        const variant = res.data || res;
        const init = {
          color: variant.image?.color || "",
          size_value: variant.size?.size_value || "",
          price: variant.price,
          quantity: variant.quantity,
          isDeploy: variant.onDeploy || false, // ✅ dùng giá trị từ server
        };
        setInitialValues(init);
        form.setFieldsValue(init);
        setImageUrl(variant.image?.url);
        setIsChanged(false);
      });
    }
  }, [open, id]);

  const handleFormChange = () => {
    if (!initialValues) return;
    const currentValues = form.getFieldsValue();
    const hasChanged =
      JSON.stringify(currentValues) !== JSON.stringify(initialValues);
    setIsChanged(hasChanged || !!fileObj);
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    console.log("📷 Đang tải ảnh:", file.name);
    reader.onload = (e) => setImageUrl(e.target.result);
    reader.readAsDataURL(file);
    setFileObj(file);
    setIsChanged(true);
    return false;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => formData.append(k, v));
      if (fileObj) formData.append("image", fileObj);

      console.log("📦 Dữ liệu gửi đi:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      await api.put(`/variant/${id}`, formData);
    } catch (err) {
      console.error("❌ Submit error:", err);
    } finally {
      form.resetFields();
      setImageUrl(null);
      setFileObj(null);
      setIsChanged(false);
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Chỉnh sửa</Button>
      <Modal
        open={open}
        title="Chỉnh sửa biến thể sản phẩm"
        onOk={handleSubmit}
        confirmLoading={loading}
        width={800}
        onCancel={() => {
          form.resetFields();
          setImageUrl(null);
          setFileObj(null);
          setIsChanged(false);
          setOpen(false);
        }}
        okButtonProps={{
          disabled: !isChanged,
        }}
        okText="Lưu thay đổi"
      >
        <Row gutter={24}>
          {/* Ảnh */}
          <Col span={10}>
            <Card bordered={false} style={{ textAlign: "center" }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="variant"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    objectFit: "cover",
                    marginBottom: 12,
                    maxHeight: 300,
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px dashed #d9d9d9",
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <span>Chưa có ảnh</span>
                </div>
              )}

              <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
              </Upload>
            </Card>
          </Col>

          {/* Form */}
          <Col span={14}>
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleFormChange}
            >
              <Form.Item
                name="color"
                label="Màu sắc"
                rules={[{ required: true, message: "Vui lòng nhập màu sắc" }]}
              >
                <Input placeholder="VD: Đỏ, Xanh, Đen..." />
              </Form.Item>

              <Form.Item
                name="size_value"
                label="Kích thước"
                rules={[
                  { required: true, message: "Vui lòng nhập kích thước" },
                ]}
              >
                <Input placeholder="VD: M, L, XL..." />
              </Form.Item>

              <Form.Item
                name="price"
                label="Giá"
                rules={[
                  { required: true, message: "Vui lòng nhập giá" },
                  { type: "number", min: 1, message: "Giá phải > 0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(v) => v.replace(/,/g, "")}
                />
              </Form.Item>

              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng" },
                  { type: "number", min: 1, message: "Số lượng phải > 0" },
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              {/* ✅ Switch hoạt động đúng */}
              <Form.Item
                name="isDeploy"
                label="Trạng thái triển khai"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Đang bán"
                  unCheckedChildren="Dừng bán"
                  onChange={(checked) => {
                    form.setFieldValue("isDeploy", checked);
                    setIsChanged(true);
                  }}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default FormEditVariant;
