import {
  Input,
  Select,
  SelectItem,
  Card,
  Avatar,
  Button,
  Chip,
  useDisclosure,
} from "@heroui/react";
import { Search } from "lucide-react";
import UserTable from "../components/UserTable";
import { useState, useEffect } from "react";
import useUsers from "../hooks/useUsers";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import ConfirmModal from "../components/ConfirmModal";
import useOrders from "../hooks/useOrder";
import { Link, useNavigate } from "react-router-dom";

function formatLastActivity(date) {
  if (!date) return "-";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  if (minutes < 1) return <em className="italic">Mới đây</em>;
  if (minutes < 60) return <em className="italic">{minutes} phút trước</em>;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return <em className="italic">{hours} giờ trước</em>;
  const days = Math.floor(hours / 24);
  return <em className="italic">{days} ngày trước</em>;
}

const columns = [
  { name: "STT", uid: "stt" },
  { name: "TÊN ĐĂNG NHẬP", uid: "name" },
  { name: "VAI TRÒ", uid: "role" },
  { name: "TRẠNG THÁI", uid: "status" },
  { name: "LẦN HOẠT ĐỘNG CUỐI", uid: "lastActivity" },
  { name: "HÀNH ĐỘNG", uid: "actions" },
];

export default function UserList() {
  const [inputSearch, setInputSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
    page: 1,
    limit: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useUsers(filters);
  const { toggleUserActive } = useAuth();

  const [order, setOrder] = useState([]);

  let { data: orders } = useOrders();

  const toast = useToast();

  // ConfirmModal hook
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const [userToConfirm, setUserToConfirm] = useState(null);

  // debounce input search
  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: inputSearch, page: 1 }));
    }, 500);
    return () => clearTimeout(delay);
  }, [inputSearch]);

  const users = data?.data?.users || [];
  const pagination = data?.pagination || {};

  if (!orders) return;

  // --- Handlers ---
  const handleView = (user) => {
    setSelectedUser(user);

    // Nếu contact.user là ObjectId (từ Mongo), cần toString()
    const orderByUser = orders.filter(
      (order) => order.contact?.user?.toString() === user._id
    );

    console.log(orderByUser);

    // Chỉ set nếu có đơn hàng
    if (orderByUser.length > 0) {
      setOrder(orderByUser);
    } else {
      setOrder([]); // hoặc thông báo "Không có đơn hàng"
    }

    setIsModalOpen(true);
  };

  const handleEdit = (user) => console.log("Edit:", user);

  // ⚡ Thay thế window.confirm bằng ConfirmModal
  const handleDelete = (user) => {
    setUserToConfirm(user);
    onConfirmOpen();
  };

  const handleConfirmDelete = () => {
    if (!userToConfirm) return;
    const action = userToConfirm.isActive ? "khóa" : "mở khóa";

    toggleUserActive.mutate(
      { userId: userToConfirm._id, isActive: !userToConfirm.isActive },
      {
        onSuccess: () => {
          toast.success(
            "Thành công",
            `Đã ${action} người dùng ${userToConfirm.username}`
          );
          onConfirmClose();
        },
        onError: (err) => {
          console.error(err);
          toast.error("Thất bại", "Có lỗi xảy ra, vui lòng thử lại.");
          onConfirmClose();
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* ---- Bộ lọc ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Select
            label="Trạng thái"
            className="w-44 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
            onChange={(e) =>
              setFilters({ ...filters, isActive: e.target.value, page: 1 })
            }
            selectedKeys={[filters.isActive || ""]}
          >
            <SelectItem key="">Tất cả</SelectItem>
            <SelectItem key="true">Đã xác thực</SelectItem>
            <SelectItem key="false">Đã bị khóa</SelectItem>
          </Select>

          <Select
            label="Vai trò"
            className="w-44 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
            onChange={(e) =>
              setFilters({ ...filters, role: e.target.value, page: 1 })
            }
            selectedKeys={[filters.role || ""]}
          >
            <SelectItem key="">Tất cả</SelectItem>
            <SelectItem key="admin">Quản lí</SelectItem>
            <SelectItem key="seller">Người bán hàng</SelectItem>
            <SelectItem key="user">Người dùng</SelectItem>
          </Select>
        </div>

        <Input
          placeholder="Tìm kiếm người dùng..."
          startContent={<Search size={18} />}
          className="w-full sm:w-80 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
          variant="bordered"
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
        />
      </div>

      {/* ---- Bảng dữ liệu ---- */}
      <UserTable
        columns={columns}
        data={users}
        pagination={users.length > 0 ? pagination : null}
        page={filters.page}
        onPageChange={(newPage) =>
          setFilters((prev) => ({ ...prev, page: newPage }))
        }
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isFetching && !isLoading && (
        <p className="mt-2 text-center text-gray-500">Đang tải...</p>
      )}
      {!isLoading && users.length === 0 && (
        <p className="mt-2 text-center text-gray-500">Không có dữ liệu</p>
      )}

      {/* ---- Confirm Modal ---- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        title="Xác nhận thay đổi trạng thái"
        message={
          userToConfirm
            ? `Bạn có chắc muốn ${
                userToConfirm.isActive ? "khóa" : "mở khóa"
              } người dùng "${userToConfirm.username}" không?`
            : ""
        }
        confirmText={userToConfirm?.isActive ? "Khóa" : "Mở khóa"}
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
      />

      {/* ---- Modal chi tiết ---- */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] p-6 z-10 overflow-y-auto animate-fadeIn">
            <div className="flex items-start gap-6 pb-4 border-b border-blue-200">
              <div className="flex-shrink-0 flex flex-col items-center">
                <Avatar
                  src={selectedUser.avatar || ""}
                  radius="full"
                  className="w-32 h-32 border-4 border-blue-400 shadow-md"
                />
                <span className="mt-2 text-lg font-semibold">
                  {selectedUser.username}
                </span>
                <Chip
                  color={selectedUser.isActive ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {selectedUser.isActive ? "Hoạt động" : "Ngưng hoạt động"}
                </Chip>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4 text-gray-700">
                {selectedUser.fullname && (
                  <p className="flex items-center gap-2">
                    <i className="lucide-user text-blue-500"></i>
                    <strong>Họ & tên:</strong> {selectedUser.fullname}
                  </p>
                )}
                {selectedUser.email && (
                  <p className="flex items-center gap-2">
                    <i className="lucide-mail text-blue-500"></i>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                )}
                {selectedUser.phone && (
                  <p className="flex items-center gap-2">
                    <i className="lucide-phone text-blue-500"></i>
                    <strong>SĐT:</strong> {selectedUser.phone}
                  </p>
                )}
                {selectedUser.address && (
                  <p className="flex items-center gap-2">
                    <i className="lucide-map-pin text-blue-500"></i>
                    <strong>Địa chỉ:</strong> {selectedUser.address}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <i className="lucide-award text-blue-500"></i>
                  <strong>Role:</strong> {selectedUser.role}
                </p>
                <p className="flex items-center gap-2">
                  <i className="lucide-star text-blue-500"></i>
                  <strong>Rank:</strong> {selectedUser.rank || "-"}
                </p>
                <p className="flex items-center gap-2">
                  <i className="lucide-credit-card text-blue-500"></i>
                  <strong>Tổng thanh toán:</strong> {selectedUser.totalPayment}{" "}
                  đ
                </p>
                <p className="flex items-center gap-2">
                  <i className="lucide-clock text-blue-500"></i>
                  <strong>Lần hoạt động cuối:</strong>{" "}
                  {formatLastActivity(selectedUser.lastActivity)}
                </p>
              </div>
            </div>

            {selectedUser.role === "user" && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
                  <i className="lucide-shopping-cart text-blue-500"></i>
                  Lịch sử đơn hàng
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-separate border-spacing-0 rounded-lg shadow-md">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-gray-700 font-medium uppercase tracking-wider rounded-tl-lg">
                          Mã đơn
                        </th>
                        <th className="px-5 py-3 text-center text-gray-700 font-medium uppercase tracking-wider">
                          Ngày đặt
                        </th>
                        <th className="px-5 py-3 text-left text-gray-700 font-medium uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-5 py-3 text-center text-gray-700 font-medium uppercase tracking-wider">
                          Sản phẩm
                        </th>
                        <th className="px-5 py-3 text-center text-gray-700 font-medium uppercase tracking-wider rounded-tr-lg">
                          Tổng tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.length > 0 ? (
                        order.map((order, idx) => (
                          <tr
                            key={order.id}
                            onClick={() =>
                              navigate("/admin/orders", {
                                state: { order },
                              })
                            }
                            className={`transition-all ${
                              idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                            } hover:bg-blue-100 cursor-pointer`}
                          >
                            <td className="px-5 py-3 font-medium text-gray-800">
                              {order._id}
                            </td>
                            <td className="px-5 py-3 text-gray-700 text-center">
                              {new Date(order.createdAt).toLocaleString(
                                "vi-VN",
                                {
                                  timeZone: "Asia/Ho_Chi_Minh",
                                }
                              )}
                            </td>
                            <td className="px-5 py-3 text-gray-700">
                              <p>
                                {order.status === "Pending"
                                  ? "Đang xử lý"
                                  : order.status === "Cancelled"
                                  ? "Đã hủy"
                                  : order.status === "Successful"
                                  ? "Đã giao"
                                  : "Chưa cập nhật"}
                              </p>
                            </td>
                            <td className="px-5 py-3 text-gray-700">
                              <div className="flex gap-2 items-center">
                                <div className="flex flex-col">
                                  {(() => {
                                    const firstItem = order.orderStore[0]
                                      ?.orderItem[0]
                                      ? order.orderStore[0]?.orderItem[0]
                                      : order.orderStore[1]?.orderItem[0];
                                    const totalItems = order.orderStore.reduce(
                                      (sum, store) =>
                                        sum + store.orderItem.length,
                                      0
                                    );

                                    return (
                                      <div className="flex items-center gap-2">
                                        {firstItem && (
                                          <img
                                            src={firstItem.variant_id.image.url}
                                            height={40}
                                            width={40}
                                            className="rounded-md object-cover border border-gray-200"
                                          />
                                        )}
                                        <span className="font-medium text-gray-800">
                                          {totalItems} sản phẩm
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 font-semibold text-blue-600 text-center">
                              {order.final_amount?.toLocaleString("vi-VN")} đ
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-6 text-center text-gray-500 italic"
                          >
                            Chưa có đơn hàng
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end border-t border-blue-200 pt-4">
              <Button
                color="primary"
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
