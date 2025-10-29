import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input, Button } from "@heroui/react";
import { XCircle } from "lucide-react";
import useToast from "../hooks/useToast";
import api from "../utils/api";

export default function ProductCreate() {
  const toast = useToast();

  const [variants, setVariants] = useState([
    {
      colorName: "",
      image: null,
      previewUrl: "",
      sizes: [
        { label: "S", stock: 0 },
        { label: "M", stock: 0 },
        { label: "L", stock: 0 },
        { label: "XL", stock: 0 },
        { label: "2XL", stock: 0 },
      ],
    },
  ]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Tên sản phẩm không được để trống"),
    category: Yup.string().required("Vui lòng chọn danh mục"),
    price: Yup.number()
      .typeError("Giá phải là số")
      .positive("Giá phải lớn hơn 0")
      .required("Nhập giá sản phẩm"),
    discountPercent: Yup.number()
      .min(0, "Tối thiểu 0%")
      .max(100, "Tối đa 100%")
      .required("Nhập phần trăm giảm giá"),
    description: Yup.string()
      .min(10, "Mô tả quá ngắn (tối thiểu 10 ký tự)")
      .required("Vui lòng nhập mô tả sản phẩm"),
    SKU: Yup.string().required("Mã SKU là bắt buộc"),
  });

  const initialValues = {
    name: "",
    category: "",
    price: "",
    discountPercent: 0,
    description: "",
    SKU: "",
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        colorName: "",
        image: null,
        previewUrl: "",
        sizes: [
          { label: "S", stock: 0 },
          { label: "M", stock: 0 },
          { label: "L", stock: 0 },
          { label: "XL", stock: 0 },
          { label: "2XL", stock: 0 },
        ],
      },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      toast.error("Lỗi", "Cần ít nhất một biến thể màu!");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  // 📸 Upload đúng 1 ảnh cho từng màu
  const handleImageUpload = (e, variantIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const newVariants = [...variants];
    newVariants[variantIndex].image = file;
    newVariants[variantIndex].previewUrl = previewUrl;
    setVariants(newVariants);

    e.target.value = "";
  };

  const validateVariants = () => {
    for (const [i, v] of variants.entries()) {
      if (!v.colorName.trim()) return `Chưa nhập tên màu cho biến thể ${i + 1}`;
      if (!v.image) return `Biến thể "${v.colorName || i + 1}" chưa có ảnh`;
      const invalidStock = v.sizes.some((s) => s.stock < 0);
      if (invalidStock)
        return `Tồn kho không hợp lệ trong biến thể "${v.colorName}"`;
    }
    return null;
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const variantError = validateVariants();
      if (variantError) {
        toast.error("Thiếu thông tin", variantError);
        return;
      }

      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => formData.append(key, val));

      const variantsData = variants.map((v) => ({
        colorName: v.colorName,
        colorCode: v.colorCode,
        sizes: v.sizes,
      }));
      formData.append("variants", JSON.stringify(variantsData));

      // 🟢 Chỉ 1 ảnh cho mỗi biến thể
      variants.forEach((variant, i) => {
        if (variant.image) {
          formData.append(`image_${i}`, variant.image);
        }
      });

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Thành công", "Đã thêm sản phẩm mới!");
      resetForm();
      setVariants([
        {
          colorName: "",
          colorCode: "#000000",
          image: null,
          previewUrl: "",
          sizes: [
            { label: "S", stock: 0 },
            { label: "M", stock: 0 },
            { label: "L", stock: 0 },
            { label: "XL", stock: 0 },
            { label: "2XL", stock: 0 },
          ],
        },
      ]);
    } catch (err) {
      toast.error(
        "Lỗi",
        err.response?.data?.message || "Không thể tạo sản phẩm"
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto mt-6">
      <h2 className="text-2xl font-semibold text-blue-600 mb-6">
        Thêm sản phẩm mới
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="grid grid-cols-10 gap-8">
            <div className="col-span-5 space-y-5">
              <FieldGroup
                label="Tên sản phẩm"
                name="name"
                placeholder="VD: Áo thun nam cotton"
              />
              <SelectGroup label="Danh mục" name="category" />
              <PriceGroup />
              <FieldGroup label="Mã SKU" name="SKU" placeholder="VD: TS001" />
              <DescriptionGroup />
            </div>

            <div className="col-span-5">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Biến thể màu sắc
                </label>
                <Button color="primary" onPress={addVariant}>
                  + Thêm màu
                </Button>
              </div>

              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-4 mb-5 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-blue-600">
                      Màu {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Xoá
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input
                      placeholder="Tên màu (VD: Đen)"
                      value={variant.colorName}
                      onChange={(e) => {
                        const newV = [...variants];
                        newV[index].colorName = e.target.value;
                        setVariants(newV);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6 items-start">
                    <div>
                      <SizeTable
                        variant={variant}
                        index={index}
                        variants={variants}
                        setVariants={setVariants}
                      />
                    </div>

                    <div>
                      <ImageUpload
                        index={index}
                        variant={variant}
                        variants={variants}
                        setVariants={setVariants}
                        handleImageUpload={handleImageUpload}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-8">
                <Button
                  type="submit"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang tải..." : "Tạo sản phẩm"}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

/* ----- Component phụ ----- */

function FieldGroup({ label, name, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <Field name={name} as={Input} placeholder={placeholder} fullWidth />
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-xs mt-1"
      />
    </div>
  );
}

function SelectGroup({ label, name }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <Field name={name} as="select" className="w-full border rounded-lg p-2">
        <option value="">-- Chọn danh mục --</option>
        <option value="Pants">Pants</option>
        <option value="T-Shirt">T-Shirt</option>
        <option value="Jacket">Jacket</option>
        <option value="Shirt">Shirt</option>
        <option value="Sweater">Sweater</option>
        <option value="Accessories">Accessories</option>
      </Field>
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-xs mt-1"
      />
    </div>
  );
}

function PriceGroup() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FieldGroup label="Giá gốc" name="price" placeholder="VD: 250000" />
      <FieldGroup
        label="Giảm giá (%)"
        name="discountPercent"
        placeholder="VD: 10"
      />
    </div>
  );
}

function DescriptionGroup() {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        Mô tả sản phẩm
      </label>
      <Field
        as="textarea"
        name="description"
        rows="5"
        className="w-full border rounded-lg p-2"
        placeholder="Mô tả chi tiết về sản phẩm..."
      />
      <ErrorMessage
        name="description"
        component="div"
        className="text-red-500 text-xs mt-1"
      />
    </div>
  );
}

function ImageUpload({
  index,
  variant,
  variants,
  setVariants,
  handleImageUpload,
}) {
  const openUpload = (e) => {
    e.stopPropagation();
    document.getElementById(`imageUpload_${index}`).click();
  };

  const handleRemoveImage = () => {
    const newVariants = [...variants];
    newVariants[index].image = null;
    newVariants[index].previewUrl = "";
    setVariants(newVariants);
  };

  return (
    <div>
      <label className="block text-sm mb-2 text-gray-700">
        Ảnh sản phẩm cho màu này
      </label>

      <div
        className={`w-full border-2 border-dashed rounded-lg bg-white transition overflow-hidden ${
          variant.previewUrl
            ? "border-blue-400 p-2"
            : "border-gray-300 h-32 flex flex-col items-center justify-center"
        }`}
      >
        {!variant.previewUrl ? (
          <button
            type="button"
            onClick={openUpload}
            className="flex flex-col items-center justify-center h-full w-full cursor-pointer hover:text-blue-500 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-gray-500 text-sm mt-1">Tải ảnh sản phẩm</p>
          </button>
        ) : (
          <div className="relative group border rounded-lg overflow-hidden aspect-square">
            <img
              src={variant.previewUrl}
              alt=""
              className="object-cover w-full h-full group-hover:opacity-80 transition"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition"
            >
              <XCircle size={18} className="text-red-500" />
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        id={`imageUpload_${index}`}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, index)}
      />
    </div>
  );
}

function SizeTable({ variant, index, variants, setVariants }) {
  return (
    <div className="mt-2">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        Bảng size & số lượng
      </label>

      <div className="space-y-1.5">
        {variant.sizes.map((size, sIndex) => (
          <div
            key={sIndex}
            className="w-2/3 flex items-center justify-between  rounded-md px-2 py-1.5 bg-white hover:bg-gray-50 transition text-sm"
          >
            <p className="font-medium text-gray-700">{size.label}</p>
            <input
              min="0"
              value={size.stock}
              onChange={(e) => {
                const newV = [...variants];
                newV[index].sizes[sIndex].stock = Number(e.target.value);
                setVariants(newV);
              }}
              className="border rounded w-20 text-center p-1 text-sm focus:ring-1 focus:ring-blue-400 outline-none transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
