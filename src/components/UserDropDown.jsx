import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import useToast from "../hooks/useToast";

const UserDropDown = ({ user }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout.mutate(null, {
      onSuccess: () => {
        navigate("/authen/login");
        toast.success("Thành công", "Đăng xuất thành công");
      },
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 cursor-pointer  px-2 py-1 rounded-lg transition border border-transparent "
      >
        <img
          src={user.avatar}
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover border border-gray-300"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold text-gray-800">
            {user.username}
          </span>
          <span className="text-[12px] text-gray-500">{user.email}</span>
        </div>
      </div>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50
        transition-all duration-200 origin-top-right
        ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 border-b border-gray-200 transition cursor-pointer"
          onClick={() => navigate("/admin/profile")}
        >
          <Cog6ToothIcon className="w-5 h-5" />
          Cài đặt
        </button>

        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-[15px] text-red-600 hover:bg-gray-50 hover:border-gray-300 transition rounded-b-lg cursor-pointer"
          onClick={handleLogout}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserDropDown;
