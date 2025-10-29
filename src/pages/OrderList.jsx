import {
  Input,
  Select,
  SelectItem,
  Card,
  Button,
  Chip,
  useDisclosure,
} from "@heroui/react";
import React from "react";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import useOrders from "../hooks/useOrder";
import useToast from "../hooks/useToast";
import ConfirmModal from "../components/ConfirmModal";
import OrderTable from "../components/OrderTable";
import { useLocation } from "react-router-dom";

// helper format ngày
function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("vi-VN");
}

// helper format tiền
function formatCurrency(amount) {
  return amount?.toLocaleString("vi-VN") + " đ";
}

const columns = [
  { name: "STT", uid: "stt", width: "4%" },
  { name: "MÃ ĐƠN", uid: "code", width: "22%" },
  { name: "NGƯỜI ĐẶT", uid: "user" },
  { name: "TRẠNG THÁI", uid: "status" },
  { name: "TỔNG TIỀN", uid: "total" },
  { name: "NGÀY TẠO", uid: "createdAt" },
  { name: "HÀNH ĐỘNG", uid: "actions" },
];

export default function OrderList() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const location = useLocation();
  const orderUser = location.state?.order || null;
  const [inputSearch, setInputSearch] = useState(
    orderUser ? orderUser._id : ""
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (orderUser) {
      setSelectedOrder(orderUser);
      setIsModalOpen(true);
    }
  }, [orderUser]);

  const { data, isLoading, isFetching } = useOrders();
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

  const orders = data.filter((order) =>
    order._id?.toLowerCase().includes(inputSearch.toLowerCase().trim())
  );
  console.log(orders);
  const pagination = data?.pagination || {};

  // Handlers
  const handleView = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (order) => {
    setOrderToConfirm(order);
    onConfirmOpen();
  };

  const handleConfirmDelete = () => {
    if (!orderToConfirm) return;

    // gọi API huỷ đơn hoặc xóa đơn ở đây
    toast.success("Thành công", `Đã huỷ đơn ${orderToConfirm.code}`);
    onConfirmClose();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Select
            label="Trạng thái đơn"
            className="w-48 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            selectedKeys={[filters.status || ""]}
          >
            <SelectItem key="">Tất cả</SelectItem>
            <SelectItem key="pending">Đang xử lý</SelectItem>
            <SelectItem key="shipping">Đang giao</SelectItem>
            <SelectItem key="completed">Hoàn thành</SelectItem>
            <SelectItem key="cancelled">Đã hủy</SelectItem>
          </Select>
        </div>

        <Input
          placeholder="Tìm mã đơn..."
          startContent={<Search size={18} />}
          className="w-full sm:w-80 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
          variant="bordered"
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
        />
      </div>

      {/* Bảng đơn hàng */}
      <OrderTable
        columns={columns}
        data={orders}
        pagination={orders.length > 0 ? pagination : null}
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
      {!isLoading && orders.length === 0 && (
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
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}

          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Nội dung modal */}
          <div className="relative bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] p-6 z-10 overflow-y-auto animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Chi tiết đơn hàng #{selectedOrder._id}
            </h2>

            {/* Thông tin chung */}
            <div className="grid grid-cols-2 gap-4 text-gray-700 border-b border-yellow-300 pb-4 mb-4">
              <p>
                <strong>Người đặt:</strong> {selectedOrder.contact?.name}
              </p>
              <p>
                <strong>SĐT:</strong> {selectedOrder.contact?.phone}
              </p>

              <p>
                <strong>Trạng thái:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}
              </p>
              <p className="col-span-2">
                <strong>Địa chỉ:</strong>{" "}
                {`${selectedOrder.contact.detail}, ${selectedOrder.contact.ward}, ${selectedOrder.contact.district}, ${selectedOrder.contact.province}`}
              </p>
            </div>

            {/* Danh sách sản phẩm */}
            <h3 className="font-semibold mb-3 text-lg text-gray-800">
              Danh sách sản phẩm
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-amber-50 shadow-md">
              <table className="w-full text-sm text-gray-700">
                {/* Header */}
                <thead className="bg-amber-200 text-amber-900">
                  <tr className="text-left">
                    <th className="py-3 px-4 font-semibold ">Cửa hàng</th>
                    <th className="py-3 px-4 text-center font-semibold w-2/7 ">
                      Sản phẩm
                    </th>
                    <th className="py-3 px-4 text-center font-semibold">
                      Số lượng
                    </th>
                    <th className="py-3 px-4 text-center font-semibold">Giá</th>
                    <th className="py-3 px-4 text-center font-semibold">
                      Thành tiền
                    </th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {selectedOrder.orderStore.map((store) => (
                    <React.Fragment key={store._id}>
                      {/* Tên cửa hàng */}
                      <tr className="bg-amber-100">
                        <td
                          colSpan="5"
                          className="py-3 px-4 font-semibold text-amber-800 border-y border-amber-300"
                        >
                          {store.store.name}
                        </td>
                      </tr>

                      {/* Danh sách sản phẩm */}
                      {store.orderItem.map((item, idx) => (
                        <tr
                          key={item._id || idx}
                          className={`${
                            idx % 2 === 0 ? "bg-amber-50" : "bg-amber-50/80"
                          } border-b border-amber-200 hover:bg-amber-200 transition-all duration-200`}
                        >
                          {/* Cột cửa hàng trống */}
                          <td className="py-3 px-4"></td>

                          {/* Ảnh + tên sản phẩm */}
                          <td className="py-3 px-4 flex  items-center justify-left text-center gap-2">
                            {item.variant_id?.image?.url ? (
                              <img
                                src={item.variant_id.image.url}
                                alt={item.variant_id.product_id.name}
                                className="w-14 h-14 object-cover rounded-xl border border-amber-200 shadow-sm"
                              />
                            ) : (
                              <span className="text-gray-400 italic">
                                Không có ảnh
                              </span>
                            )}
                            <div className="flex flex-col w-52">
                              <span className="font-medium text-gray-800">
                                {item.variant_id.product_id.name}
                              </span>
                              <span className="text-xs text-gray-600">
                                Size: {item.variant_id.size.size_value} • Màu:{" "}
                                {item.variant_id?.image.color}
                              </span>
                            </div>
                          </td>

                          {/* Số lượng */}
                          <td className="py-3 px-4 text-center text-gray-700">
                            {item.quantity}
                          </td>

                          {/* Giá */}
                          <td className="py-3 px-4 text-center text-gray-700">
                            {item.variant_id.price?.toLocaleString("vi-VN")} đ
                          </td>

                          {/* Thành tiền */}
                          <td className="py-3 px-4 text-center font-semibold text-amber-700">
                            {(
                              item.variant_id.price * item.quantity
                            ).toLocaleString("vi-VN")}{" "}
                            đ
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right mt-4">
              <strong>Tổng cộng:</strong>{" "}
              <span className="text-lg text-orange-600 font-semibold">
                {formatCurrency(selectedOrder.final_amount)}
              </span>
            </div>

            {/* Nút đóng */}
            <div className="mt-6 flex justify-end border-t border-yellow-300 pt-4">
              <Button
                color="warning"
                onClick={() => setIsModalOpen(false)}
                className="hover:shadow-lg transition-all"
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
