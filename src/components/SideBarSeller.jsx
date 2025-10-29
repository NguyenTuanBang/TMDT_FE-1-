import {
  Squares2X2Icon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  InboxIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function Sidebar() {
  const { user, isLoading } = useAuth();

  const menu = [
    { name: "Dashboard", icon: Squares2X2Icon, link: "/seller/dashboard" },
    {
      name: "Quản lí khách hàng",
      icon: UserGroupIcon,
      link: "/seller/customers",
    },
    {
      name: "Quản lí cửa hàng",
      icon: BuildingStorefrontIcon,
      link: "/seller/stores",
    },
    { name: "Quản lí sản phẩm", icon: CubeIcon, link: "/seller/products" },
    {
      name: "Quản lí đơn hàng",
      icon: ClipboardDocumentListIcon,
      link: "/seller/orders",
    },
    { name: "Yêu cầu", icon: InboxIcon, link: "/seller/requests" },
  ];

  if (isLoading) return <p>Loading...</p>;
  if (!user) return <p>Chưa đăng nhập</p>;

  return (
    <div className="h-[90vh] bg-white  border-gray-300 flex flex-col">
      <nav className="flex-1 space-y-1 overflow-y-auto mt-2 px-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.link}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition 
              ${
                isActive
                  ? "bg-gray-300 font-semibold text-gray-900"
                  : "text-gray-700 hover:bg-gray-300"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
