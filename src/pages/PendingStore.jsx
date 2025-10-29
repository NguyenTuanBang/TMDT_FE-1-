import { useEffect, useState } from "react";
import api from "../utils/api"; // axios instance
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Avatar,
  Chip,
} from "@heroui/react";
import { format } from "date-fns";

export default function PendingStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null); // modal
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPendingStores = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stores/pending");
      setStores(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStores();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/stores/${id}/approve`);
      fetchPendingStores();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/stores/${id}/reject`);
      fetchPendingStores();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (store) => {
    setSelectedStore(store);
    setModalOpen(true);
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 text-lg">Đang tải...</p>
    );
  if (stores.length === 0)
    return (
      <p className="text-center mt-10 text-gray-500 text-lg">
        Không có cửa hàng đang chờ xét duyệt
      </p>
    );

  const statusColorMap = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };

  return (
    <div className="p-6 bg-gray-50 ">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Cửa hàng đang chờ xét duyệt
      </h2>

      <Table
        className=" rounded-2xl  shadow-lg bg-white border border-gray-200"
        classNames={{
          th: "bg-blue-600 text-white text-sm font-semibold uppercase tracking-wide py-3",
          tr: "hover:bg-blue-50 transition-colors duration-200 cursor-pointer",
          td: "text-gray-800 text-sm font-medium py-3 px-4",
        }}
      >
        <TableHeader>
          <TableColumn style={{ width: "4%" }} className="text-center">
            STT
          </TableColumn>
          <TableColumn>Tên cửa hàng</TableColumn>
          <TableColumn>Email chủ cửa hàng</TableColumn>
          <TableColumn>Chủ cửa hàng</TableColumn>
          <TableColumn>Địa chỉ</TableColumn>
          <TableColumn>SĐT</TableColumn>
          <TableColumn>Ngày tạo</TableColumn>
          <TableColumn>Trạng thái</TableColumn>
          <TableColumn className="text-center">Hành động</TableColumn>
        </TableHeader>

        <TableBody items={stores}>
          {(store) => {
            const index = stores.indexOf(store) + 1; // +1 vì STT bắt đầu từ 1
            return (
              <TableRow key={store._id}>
                <TableCell className="text-center">{index}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.user.email}</TableCell>
                <TableCell>{store.user.username}</TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>{store.phone}</TableCell>
                <TableCell>
                  {format(new Date(store.createdAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <Chip
                    color={statusColorMap[store.status] || "warning"}
                    size="sm"
                    className="capitalize"
                  >
                    {store.status}
                  </Chip>
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    className="hover:shadow-md transition-all"
                    onClick={() => openModal(store)}
                  >
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      {/* Modal chi tiết */}
      {modalOpen && selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity"
            onClick={() => setModalOpen(false)}
          ></div>

          {/* Modal */}
          <div className="relative w-full max-w-5xl p-6 rounded-3xl shadow-2xl z-10 animate-fadeIn bg-gray-300 border border-gray-200 text-gray-900">
            {/* Header */}
            <h3 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-3">
              Chi tiết cửa hàng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cửa hàng */}
              <div className="bg-gray-300  p-4 rounded-xl shadow-sm space-y-2">
                <p>
                  <strong>Tên cửa hàng:</strong> {selectedStore.name}
                </p>
                <p>
                  <strong>Chủ cửa hàng:</strong> {selectedStore.user.username}
                </p>
                <p>
                  <strong>Email:</strong> {selectedStore.user.email}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {selectedStore.address}
                </p>
                <p>
                  <strong>SĐT:</strong> {selectedStore.phone}
                </p>
                <p>
                  <strong>SKU:</strong> {selectedStore.SKU_code}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {format(
                    new Date(selectedStore.createdAt),
                    "dd/MM/yyyy HH:mm"
                  )}
                </p>
              </div>

              {/* Ảnh CCCD */}
              <div className="bg-gray-300 p-4 rounded-xl shadow-sm">
                <strong>CMND / CCCD:</strong>
                <div className="flex gap-4 mt-3">
                  {selectedStore.citizenImageFront && (
                    <img
                      src={selectedStore.citizenImageFront}
                      alt="CCCD Front"
                      className="w-54 h-36 object-cover rounded-lg border border-gray-400 shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                    />
                  )}
                  {selectedStore.citizenImageBack && (
                    <img
                      src={selectedStore.citizenImageBack}
                      alt="CCCD Back"
                      className="w-54 h-36 object-cover rounded-lg border border-gray-400 shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {/* Action buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => handleApprove(selectedStore._id)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Duyệt
              </button>

              <button
                onClick={() => handleReject(selectedStore._id)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Loại
              </button>

              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
