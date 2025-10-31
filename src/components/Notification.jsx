import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import api from "../utils/api";
import { BellIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    if (!open) {
      // Mở lần đầu → fetch dữ liệu
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/reply/`);
        setNotifications(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông báo");
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  return (
    <div ref={dropdownRef} className="relative mt-2">
      {/* Nút chuông */}
      <div
        onClick={handleToggle}
        className="relative flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
      >
        <div className="relative flex items-center justify-center w-8 h-8">
          <BellIcon className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
            3
          </span>
        </div>
        <span className="text-white font-medium">Thông báo</span>

        {/* {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
            {notifications.length}
          </span>
        )} */}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Không có thông báo nào
            </div>
          ) : (
            <div className="m-3 border border-gray-200 rounded-lg p-2 bg-gray-50">
              {notifications.map((noti, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition rounded-md"
                >
                  <div className="font-semibold text-gray-800">
                    {noti.about === "store" && "Từ chối đăng kí cửa hàng"}
                    {noti.about === "order" && "Thông báo đơn hàng"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {noti.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
