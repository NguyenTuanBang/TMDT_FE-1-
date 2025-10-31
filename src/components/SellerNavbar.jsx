import { BellIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import LanguageDropDownAdmin from "./LanguageDropDownAdmin";
import useAuth from "../hooks/useAuth";
import UserDropDown from "./UserDropDown";
import NotificationDropdown from "./Notification";

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const languageOptions = [
    { key: "vi", label: "Tiếng Việt" },
    { key: "en", label: "English" },
  ];

  const menu = [
    { to: "/seller/dashboard", label: "Dashboard" },
    { to: "/seller/users", label: "Người dùng" },
    { to: "/seller/stores", label: "Cửa hàng" },
    { to: "/seller/products", label: "Sản phẩm" },
    { to: "/seller/orders", label: "Đơn hàng" },
    { to: "/seller/requests", label: "Yêu cầu" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);
   const handleToggleDropdown = async () => {
      if (!openDropdown) {
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
      setOpenDropdown(!openDropdown);
    };

  return (
    <nav className="top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 text-gray-800">
          {/* LEFT: Logo + Menu */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <img src="/logo.png" className="w-10 h-10" alt="logo" />
              <p>TMDT</p>
            </div>

            {/* Menu */}
            <div className="hidden md:flex gap-1 font-medium">
              {menu.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg transition cursor-pointer
                    ${
                      isActive(item.to)
                        ? "bg-gray-300 text-gray-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: Notifications + Language + User */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div
              className="relative flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
              onClick={handleToggleDropdown}
            >
              <div className="relative flex items-center justify-center w-8 h-8">
                <BellIcon className="w-6 h-6 text-white" />
                {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                  3
                </span> */}
              </div>
              <span className="text-white font-medium">Thông báo</span>
              {openDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-3 border-b font-semibold text-gray-800">
                    Thông báo
                  </div>

                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      Đang tải...
                    </div>
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
                            {noti.title}
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

            {/* Language */}
            <LanguageDropDownAdmin
              options={languageOptions}
              defaultValue="vi"
            />

            {/* User Dropdown */}
            {user && <UserDropDown user={user} />}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
