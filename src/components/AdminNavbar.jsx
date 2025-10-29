import { BellIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import LanguageDropDownAdmin from "./LanguageDropDownAdmin";
import useAuth from "../hooks/useAuth";
import UserDropDown from "./UserDropDown";

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const languageOptions = [
    { key: "vi", label: "Tiếng Việt" },
    { key: "en", label: "English" },
  ];

  const menu = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Người dùng" },
    { to: "/admin/stores", label: "Cửa hàng" },
    { to: "/admin/products", label: "Sản phẩm" },
    { to: "/admin/orders", label: "Đơn hàng" },
    { to: "/admin/requests", label: "Yêu cầu" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

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
            <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer">
              <div className="relative">
                <BellIcon className="w-6 h-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  3
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Thông báo
              </span>
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
