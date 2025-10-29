import {
  Input,
  Select,
  SelectItem,
  Card,
  Button,
  Chip,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import React from "react";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import useProudct, { useChangeProductStatus } from "../hooks/useProduct";
import useToast from "../hooks/useToast";
import ConfirmModal from "../components/ConfirmModal";
import ProductTable from "../components/ProductTable";
import { Star } from "lucide-react";
import { Edit2, Trash2 } from "lucide-react";
import FormCreateProduct from "../components/FormCreateProduct";

// helper format tiền
function formatCurrency(amount) {
  return amount?.toLocaleString("vi-VN") + " đ";
}

const columns = [
  { name: "STT", uid: "stt", width: "4%" },
  { name: "MÃ SẢN PHẨM", uid: "code", width: "22%" },
  { name: "SẢN PHẨM", uid: "name", width: "26%" },
  { name: "CỬA HÀNG", uid: "store" },
  { name: "TRẠNG THÁI", uid: "status" },
  { name: "HÀNH ĐỘNG", uid: "actions" },
];

export default function ProductList({ storeProduct }) {
  const [inputSearch, setInputSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const toast = useToast();
  const { mutate: changeStatus } = useChangeProductStatus();

  const { data, isLoading, isFetching } = useProudct();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const [orderToConfirm, setOrderToConfirm] = useState(null);

  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: inputSearch, page: 1 }));
    }, 500);
    return () => clearTimeout(delay);
  }, [inputSearch]);

  if (!data) return null;

  const products = storeProduct ? storeProduct : [...data];

  const pagination = data?.pagination || {};

  const handleView = (product) => {
    if (!product?.variants) return;

    const groupedByColor = product.variants.reduce((acc, item) => {
      const color = item.image?.color || "Khác";
      const existed = acc.find((c) => c.color === color);

      if (existed) {
        existed.variants.push(item);
        existed.totalQuantity += item.quantity;
      } else {
        acc.push({
          color,
          variants: [item],
          totalQuantity: item.quantity,
        });
      }

      return acc;
    }, []);

    console.log(groupedByColor);

    setSelectedProduct({
      ...product,
      groupedByColor,
    });

    setIsModalOpen(true);
  };

  const handleDelete = (order) => {
    setOrderToConfirm(order);
    onConfirmOpen();
  };

  const handleConfirmDelete = () => {
    if (!orderToConfirm) return;
    console.log(orderToConfirm);
    changeStatus({ id: orderToConfirm._id, status: "Ngừng bán" });
    toast.success("Thành công", `Đã huỷ đơn ${orderToConfirm.code}`);
    onConfirmClose();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {storeProduct && <FormCreateProduct />}
          <Select
            label="Trạng thái sản phẩm"
            className="w-48 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            selectedKeys={[filters.status || ""]}
          >
            <SelectItem key="">Tất cả</SelectItem>
            <SelectItem key="pending">Đang bán</SelectItem>
            <SelectItem key="shipping">Ngưng bán</SelectItem>
          </Select>
        </div>

        <Input
          placeholder="Tìm mã hoặc tên sản phẩm..."
          startContent={<Search size={18} />}
          className="w-full sm:w-80 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
          variant="bordered"
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
        />
      </div>

      {/* Bảng đơn hàng */}
      <ProductTable
        columns={columns}
        data={products}
        pagination={products.length > 0 ? pagination : null}
        page={filters.page}
        onPageChange={(newPage) =>
          setFilters((prev) => ({ ...prev, page: newPage }))
        }
        onView={handleView}
        onDelete={handleDelete}
      />

      {isFetching && !isLoading && (
        <p className="mt-2 text-center text-gray-500">Đang tải...</p>
      )}
      {!isLoading && products.length === 0 && (
        <p className="mt-2 text-center text-gray-500">Không có dữ liệu</p>
      )}

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        title="Xác nhận hủy đơn hàng"
        message={
          orderToConfirm
            ? `Bạn có chắc muốn hủy đơn "${orderToConfirm.code}" không?`
            : ""
        }
        confirmText="Hủy đơn"
        cancelText="Thoát"
        onConfirm={handleConfirmDelete}
      />

      {/* Modal chi tiết đơn hàng */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Nội dung modal */}
          <div className="relative bg-gradient-to-br from-green-50 via-green-100 to-emerald-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] p-6 z-10 overflow-y-auto animate-fadeIn border-2 border-green-300">
            <h2 className="text-xl font-bold mb-4 text-green-800">
              Chi tiết sản phẩm
            </h2>

            {/* Thông tin chung */}
            <div className="grid grid-cols-2 gap-4 text-gray-700 border-b border-green-300 pb-4 mb-4">
              <p>
                <strong>Tên sản phẩm </strong>
                <span className="text-emerald-700 font-bold ">
                  {selectedProduct.name}
                </span>
              </p>
              <p>
                <strong>Đã bán</strong> {selectedProduct.tradedCount}
              </p>

              <p>
                <strong>Cửa hàng</strong> {selectedProduct.store.name}
              </p>

              <p>
                <strong>Danh mục</strong>{" "}
                {selectedProduct.producttags[0]?.tag?.nameTag}
              </p>

              <div>
                <strong>Trạng thái:</strong>{" "}
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    selectedProduct.status === "pending"
                      ? "warning"
                      : selectedProduct.status === "shipping"
                      ? "primary"
                      : selectedProduct.status === "Đang bán"
                      ? "success"
                      : "danger"
                  }
                >
                  {selectedProduct.status === "pending"
                    ? "Đang xử lý"
                    : selectedProduct.status === "shipping"
                    ? "Đang giao"
                    : selectedProduct.status === "Đang bán"
                    ? "Đang bán"
                    : "Đang bán"}
                </Chip>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong>Đánh giá:</strong>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i <= Math.round(selectedProduct.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">
                    ({selectedProduct.rating?.toFixed(1) || "0.0"})
                  </span>
                </div>
              </div>

              <div className="col-span-2 text-gray-700 border-b border-green-300 pb-4 mb-4">
                <p>
                  <strong>Mô tả:</strong> {selectedProduct.description}
                </p>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <h3 className="font-semibold mb-3 text-lg text-green-800">
              Danh sách biến thể
            </h3>

            {/* Danh sách biến thể */}
            <div className="space-y-3">
              {selectedProduct.groupedByColor.map((colorGroup, index) => (
                <div
                  key={index}
                  className="border border-green-300 rounded-lg bg-white"
                >
                  <details className="group">
                    {/* Summary: hiển thị màu + tổng SL + ảnh + mũi tên */}
                    <summary className="cursor-pointer list-none p-3 flex items-center justify-between bg-green-100 hover:bg-green-200 transition rounded-lg">
                      <div className="flex items-center gap-3">
                        {/* Ảnh đại diện */}
                        <img
                          src={colorGroup.variants[0].image?.url}
                          alt={colorGroup.color}
                          className="w-10 h-10 rounded border object-cover"
                        />

                        {/* Tên màu + tổng SL */}
                        <div>
                          <p className="font-semibold text-green-800 capitalize">
                            {colorGroup.color}
                          </p>
                          <p className="text-xs text-gray-600">
                            Tổng SL: {colorGroup.totalQuantity}
                          </p>
                        </div>
                      </div>

                      {/* Mũi tên xoay */}
                      <svg
                        className="w-4 h-4 text-green-700 transition-transform duration-300 group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>

                    {/* Nội dung Accordion: chỉ còn Size – Giá – Tồn kho */}
                    <div className="p-3 overflow-x-auto animate-fadeIn">
                      <div className="p-3 overflow-x-auto animate-fadeIn">
                        <table className="min-w-full text-sm text-gray-700 table-fixed">
                          <thead className="bg-green-600 text-white text-left">
                            <tr>
                              <th className="w-10 px-4 py-2 text-center">
                                STT
                              </th>
                              <th className="w-20 px-4 py-2 text-center">
                                Size
                              </th>
                              <th className="w-28 px-4 py-2 text-center">
                                Giá
                              </th>
                              <th className="w-20 px-4 py-2 text-center">
                                Tồn kho
                              </th>
                              <th className="w-28 px-4 py-2 text-center">
                                Trạng thái
                              </th>
                              <th className="w-32 px-4 py-2 text-center">
                                Hành động
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {colorGroup.variants.map((v, idx) => (
                              <tr
                                key={idx}
                                className="border-t border-green-200 hover:bg-emerald-50 transition-colors"
                              >
                                {/* STT */}
                                <td className="px-2 py-2 text-center font-medium text-emerald-700">
                                  {idx + 1}
                                </td>

                                {/* Size */}
                                <td className="py-2 text-center font-medium text-emerald-700">
                                  {v.size.size_value}
                                </td>

                                {/* Giá */}
                                <td className="py-2 text-center font-medium text-emerald-700">
                                  {formatCurrency(v.price)}
                                </td>

                                {/* Tồn kho */}
                                <td className="py-2 text-center">
                                  {v.quantity}
                                </td>

                                {/* Trạng thái */}
                                <td className="py-2 text-center font-medium text-emerald-700">
                                  {v.onDeploy ? "Đang bán" : "Ngưng bán"}
                                </td>

                                {/* Hành động */}
                                <td className="py-2 text-center">
                                  <div className="flex justify-center gap-3">
                                    <Tooltip content="Chỉnh sửa">
                                      <span className="text-blue-600 cursor-pointer hover:scale-110 transition-transform">
                                        <Edit2 size={18} />
                                      </span>
                                    </Tooltip>

                                    <Tooltip color="danger" content="Ngưng bán">
                                      <span className="text-red-500 cursor-pointer hover:scale-110 transition-transform">
                                        <Trash2 size={18} />
                                      </span>
                                    </Tooltip>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>

            {/* Nút đóng */}
            <div className="mt-6 flex justify-end border-t border-green-300 pt-4">
              <Button
                color="success"
                onClick={() => setIsModalOpen(false)}
                className="hover:shadow-lg bg-green-600 text-white hover:bg-green-700 transition-all"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
