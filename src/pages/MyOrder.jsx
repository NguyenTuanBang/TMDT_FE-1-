import React, { useState } from "react";
import useAuth from "../hooks/useAuth";
import useOrders from "../hooks/useOrder";
import { FiChevronDown } from "react-icons/fi";
import { Button } from "antd";
import axios from "axios";
import api from "../utils/api";

function MyOrder() {
  const { data: orders } = useOrders();
  const { user } = useAuth();
  const [openOrderId, setOpenOrderId] = useState(null);

  if (!orders || !user)
    return <p className="text-center mt-4 text-blue-600">Loading...</p>;

  const userOrders = orders.filter((order) => order.contact?.user === user._id);
  console.log(userOrders);

  if (userOrders.length === 0)
    return (
      <p className="text-center mt-4 text-blue-600">
        Bạn chưa có đơn hàng nào.
      </p>
    );
  
  const handleConfirmItem = async (itemId) => {
    try {
      const url = `/orders/confirm`;
      const res = await api.post(url, { orderItemId: itemId });
      if (res.data.success) {
        // Cập nhật lại danh sách đơn hàng
        setOpenOrderId(null);
      }
    } catch (error) {
      console.error("Error confirming item:", error);
    }
  };

  const toggleAccordion = (id) => {
    setOpenOrderId(openOrderId === id ? null : id);
  };

  const handleCancelItem = async (itemId) => {
    try {
      const url = `/orders/cancel`;
      const res = await api.post(url, { orderItemId: itemId });
      if (res.data.success) {
        // Cập nhật lại danh sách đơn hàng
        setOpenOrderId(null);
      }
    } catch (error) {
      console.error("Error cancelling item:", error);
    }
  };

  const formatCurrency = (amount) => amount?.toLocaleString("vi-VN") + " đ";

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">
        Lịch sử đơn hàng
      </h2>

      {userOrders.map((order, index) => {
        const isOpen = openOrderId === order._id;

        return (
          <div
            key={order._id}
            className="rounded-xl mb-6 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-blue-50"
          >
            <button
              onClick={() => toggleAccordion(order._id)}
              className={`
    w-full flex justify-between items-center px-6 py-4 rounded-xl 
    bg-blue-200 hover:bg-blue-300 transition-all duration-300 shadow-md hover:shadow-lg
    border border-blue-200
  `}
            >
              {/* Thông tin chính */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                <span className="text-gray-400 font-medium mr-2">
                  #{index + 1}
                </span>
                <span className="hidden sm:inline text-gray-600">Mã đơn:</span>
                <span className="font-semibold text-blue-700">{order._id}</span>
                <span className="hidden sm:inline text-gray-600 ml-2">
                  | Tổng tiền:
                </span>
                <span className="font-semibold text-blue-600 ml-1">
                  {formatCurrency(order.final_amount)}
                </span>
                <span className="text-gray-600 sm:ml-auto text-sm">
                  Ngày đặt: {formatDate(order.createdAt)}
                </span>
              </div>

              {/* Icon mũi tên */}
              <FiChevronDown
                className={`
      text-2xl text-blue-600 transform transition-transform duration-300 
      ${isOpen ? "rotate-180" : "rotate-0"}
    `}
              />
            </button>

            {/* Accordion Content */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
                isOpen ? "max-h-[10000px]" : "max-h-0"
              } bg-gray-200 px-6`}
            >
              {isOpen && (
                <div className="py-5 space-y-6">
                  {/* Thông tin đơn hàng */}
                  <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
                    <p>
                      <span className="font-semibold">Người nhận:</span>{" "}
                      {order.contact?.name}
                    </p>
                    <p>
                      <span className="font-semibold">SĐT:</span>{" "}
                      {order.contact?.phone}
                    </p>
                    <p>
                      <span className="font-semibold">Ngày tạo:</span>{" "}
                      {formatDate(order.createdAt)}
                    </p>
                    <p>
                      <span className="font-semibold">Trạng thái:</span>{" "}
                      {order.status === "Pending"
                        ? "Đang xử lý"
                        : order.status === "Cancelled"
                        ? "Đã hủy"
                        : order.status === "Successful"
                        ? "Đã giao hàng"
                        : "Chưa cập nhật"}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-semibold">Địa chỉ:</span>{" "}
                      {`${order.contact?.detail || ""}, ${
                        order.contact?.ward || ""
                      }, ${order.contact?.district || ""}, ${
                        order.contact?.province || ""
                      }`}
                    </p>
                  </div>

                  {/* Danh sách store và sản phẩm */}
                  <div className="space-y-6 mt-4">
                    {order.orderStore?.map((store) => (
                      <div
                        key={store._id}
                        className="border-l-4 border-blue-600 bg-gray-200 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        {/* Tên cửa hàng */}
                        <p className="font-bold text-blue-700 mb-3 text-lg">
                          {store.store.name}
                        </p>

                        {/* Danh sách sản phẩm */}
                        <ul className="space-y-4">
                          {store.orderItem?.map((item) => (
                            <li
                              key={item._id}
                              className="flex border border-blue-300 rounded-lg p-4 hover:bg-blue-100 transition-colors duration-300"
                            >
                              {/* Thông tin sản phẩm bên trái */}
                              <div className="flex-1 flex gap-4">
                                {item.variant_id?.image?.url && (
                                  <img
                                    src={item.variant_id.image.url}
                                    alt={item.variant_id.product_id?.name}
                                    className="w-24 h-24 object-cover rounded"
                                  />
                                )}
                                <div className="flex flex-col justify-between text-gray-800">
                                  <p className="font-semibold text-blue-700 text-lg">
                                    {item.variant_id?.product_id?.name}
                                  </p>
                                  <div className="flex gap-4 mt-2 text-sm">
                                    <span>
                                      <span className="font-semibold">
                                        Size:
                                      </span>{" "}
                                      {item.variant_id?.size?.size_value ||
                                        "N/A"}
                                    </span>
                                    <span>
                                      <span className="font-semibold">
                                        {"|  "}
                                        Màu:
                                      </span>{" "}
                                      {item.variant_id?.image?.color || "N/A"}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2">
                                    <span className="font-semibold">
                                      Đơn giá:
                                    </span>{" "}
                                    {item.unitPrice || item.variant_id?.price
                                      ? formatCurrency(
                                          item.unitPrice ||
                                            item.variant_id?.price
                                        )
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end justify-end ml-4 text-blue-600 font-medium">
                                {item.status === "PENDING" && (
                                  <Button
                                    type="primary"
                                    danger
                                    onClick={() => handleCancelItem(item._id)}
                                  >
                                    Hủy hàng
                                  </Button>
                                )}
                                {item.status === "CANCELLED" && (
                                  <span className="text-red-600 font-bold">
                                    Đã hủy
                                  </span>
                                )}
                                {item.status === "COMFIRMED" && (
                                  <Button
                                    type="primary"
                                    onClick={() => handleConfirmItem(item._id)}
                                  >
                                    Xác nhận
                                  </Button>
                                )}
                                <p>
                                  <span className="font-semibold text-gray-700">
                                    Số lượng:
                                  </span>{" "}
                                  {item.quantity}
                                </p>
                                <p className="font-bold text-blue-800">
                                  <span className="font-semibold text-gray-700">
                                    Thành tiền:
                                  </span>{" "}
                                  {item.unitPrice || item.variant_id?.price
                                    ? formatCurrency(
                                        (item.unitPrice ||
                                          item.variant_id?.price) *
                                          item.quantity
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="ml-auto flex flex-col gap-1 text-right mb-4">
                <span className="text-blue-600 font-medium text-base">
                  Tạm tính: {formatCurrency(order.total_amount)}
                </span>
                <span className="text-blue-500 font-medium text-base">
                  Phí vận chuyển: {formatCurrency(order.shippingFee)}
                </span>
                <span className="text-blue-800 font-bold text-lg">
                  Tổng cộng: {formatCurrency(order.final_amount)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MyOrder;
