import React from "react";
import useAuth from "../hooks/useAuth";
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Space } from "antd";
import api from "../utils/api";
import { useState } from "react";
import useToast from "../hooks/useToast";
import dayjs from "dayjs";

const CreatePromotionForm = () => {
  const [open, setOpen] = useState(false);
  const { RangePicker } = DatePicker;
  const { user } = useAuth();
  const [type, setType] = useState("");
  const [form] = Form.useForm();
  const [submitable, setSubmitable] = useState(false);
  const toast = useToast();

  const handleTypeChange = (value) => {
    setType(value);
  };

  // Khi form thay đổi -> kiểm tra hợp lệ
  const handleFormChange = () => {
  const hasErrors = form.getFieldsError().some(({ errors }) => errors.length);
  const allTouched = form.isFieldsTouched(true);

  setSubmitable(allTouched && !hasErrors);
};
  const onFinish = async (values) => {
    try {
      const [start_date, end_date] = values.date_range;
      const payload = {
        name: values.name,
        description: values.description,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        max_discount_value: values.max_discount_value,
        quantity: values.quantity,
        start_date,
        end_date,
        scope: user?.role === "admin" ? "global" : "store",
      };
      const res = await api.post("/promotion/", payload);
      form.resetFields();
      setType("");
      toast.success("Success", "Promotion created successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error creating promotion:", error);
      toast.error("Error", "Failed to create promotion");
    }
  };
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create Promotion
      </Button>
      <Modal
        title="Thêm sản phẩm mới"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          form={form}
          onValuesChange={handleFormChange}
        >
          <Form.Item
            label="Promotion Name"
            name="name"
            rules={[
              { required: true, message: "Please input the promotion name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Type"
            name="discount_type"
            rules={[{ required: true, message: "Please input the type!" }]}
          >
            <Select
              placeholder="Select a type"
              allowClear
              onChange={(value) => handleTypeChange(value)}
            >
              <Select.Option value="percentage">Percentage</Select.Option>
              <Select.Option value="fixed">Fixed</Select.Option>
            </Select>
          </Form.Item>
          {type === "percentage" ? (
            <>
              <Form.Item
                label="Discount Value (%)"
                name="discount_value"
                rules={[
                  {
                    required: true,
                    message: "Please input the discount value!",
                  },
                ]}
              >
                <InputNumber min={1} max={100} />
              </Form.Item>
              <Form.Item
                label="Max Discount Value"
                name="max_discount_value"
                rules={[
                  {
                    required: true,
                    message: "Please input the max discount value!",
                  },
                ]}
              >
                <InputNumber  />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              label="Discount Value"
              name="discount_value"
              rules={[
                { required: true, message: "Please input the discount value!" },
              ]}
            >
              <InputNumber />
            </Form.Item>
          )}
          <Form.Item
            label="Khoảng thời gian áp dụng"
            name="date_range"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian áp dụng!" },
            ]}
          >
            <RangePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              } // không cho chọn ngày trong quá khứ
            />
          </Form.Item>
          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Please input the quantity!" }]}
          >
            <Input />
          </Form.Item>

          <Space style={{ display: "flex", justifyContent: "end" }}>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" disabled={!submitable}>
              Lưu sản phẩm
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default CreatePromotionForm;
