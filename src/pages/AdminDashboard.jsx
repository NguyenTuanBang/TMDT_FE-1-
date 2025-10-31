import React, { useState } from "react";
import {
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiPackage,
  FiDollarSign,
  FiCompass,
  FiSettings,
  FiSearch,
  FiBell,
} from "react-icons/fi";
import useOrders from "../hooks/useOrder";
import useUsers from "../hooks/useUsers";
import useStores from "../hooks/useStore";
import useProducts from "../hooks/useProduct";

export default function AdminDashboard() {
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
    page: 1,
    limit: 10,
  });

  const { data: orders } = useOrders();
  const { data: users } = useUsers(filters);
  const { data: stores } = useStores();
  const { data: products } = useProducts();

  if (!orders || !users || !stores || !products) return;

  const totalSales = orders.reduce((acc, order) => {
    acc += order.final_amount;
    return acc;
  }, 0);

  const currency = (n) => n.toLocaleString("vi-VN") + "₫";
  const totalOrders = orders.length;
  const totalStores = stores.length;
  const totalProducts = products.length;
  const totalUsers = users.data.users.filter(
    (user) => user.role === "user"
  ).length;
  const totalConfirmedUsers = users.data.users.filter(
    (user) => user.isActive && user.role === "user"
  ).length;
  const totalBannedUsers = users.data.users.filter(
    (user) => !user.isActive && user.role === "user"
  ).length;
  const totalIsActiveUsers = users.data.users.filter((user) => {
    if (!user.lastActivity) return false;

    const last = new Date(user.lastActivity);
    const now = new Date();
    const diffInMinutes = (now - last) / 1000 / 60;
    return diffInMinutes < 1;
  }).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const topProducts = [...products]
    .sort((a, b) => b.tradedCount - a.tradedCount)
    .slice(0, 3);

  const storesWithOrders = orders.reduce((acc, order) => {
    order.orderStore.forEach((os) => {
      const storeId = os.store._id;

      let existing = acc.find((item) => item.store._id === storeId);

      if (!existing) {
        existing = { store: os.store, orders: [] };
        acc.push(existing);
      }

      existing.orders.push(order);
    });

    return acc;
  }, []);

  const storeRevenues = storesWithOrders.map((store) => {
    const ordersOfStore = orders.reduce((acc, order) => {
      const storeInOrder = order.orderStore.filter(
        (s) => s.store._id === store.store._id
      );
      if (storeInOrder.length > 0) {
        acc.push(...storeInOrder);
      }
      return acc;
    }, []);

    const totalPayment = ordersOfStore.reduce(
      (acc, s) => acc + (s.finalTotal || 0),
      0
    );
    return {
      orders: ordersOfStore.length,
      storeId: store.store._id,
      storeName: store.store.name,
      totalPayment,
    };
  });

  const topStores = storeRevenues
    .sort((a, b) => b.totalPayment - a.totalPayment)
    .slice(0, 3);

  const revenueTrend = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const total = orders
      .filter((order) => {
        const created = new Date(order.createdAt);
        const year = created.getFullYear();
        return (
          year === new Date().getFullYear() && created.getMonth() + 1 === month
        );
      })
      .reduce((sum, order) => sum + (order.final_amount || 0), 0);
    return total;
  });

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      <div className="flex-1 flex flex-col">
        <main className="p-6 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-white border-2 border-gray-300 rounded-xl p-6  shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Doanh thu</div>
                  <div className="text-xl font-semibold mt-1">
                    {currency(totalSales)}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-green-50 text-green-600">
                  <FiDollarSign />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-xl p-6  shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Tổng số đơn</div>
                  <div className="text-xl font-semibold mt-1">
                    {totalOrders}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-blue-50 text-blue-600">
                  <FiPackage />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-xl p-6  shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Tổng số cửa hàng</div>
                  <div className="text-xl font-semibold mt-1">
                    {totalStores}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-indigo-50 text-indigo-600">
                  <FiUsers />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-xl p-6  shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Tổng số sản phẩm</div>
                  <div className="text-xl font-semibold mt-1">
                    {totalProducts}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-indigo-50 text-indigo-600">
                  <FiUsers />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-xl p-6  shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Tổng người dùng</div>
                  <div className="text-xl font-semibold mt-1">{totalUsers}</div>
                </div>
                <div className="p-3 rounded-md bg-indigo-50 text-indigo-600">
                  <FiUsers />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-xl p-6  shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">
                    Người dùng đã xác thực
                  </div>
                  <div className="text-xl font-semibold mt-1">
                    {totalConfirmedUsers}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-indigo-50 text-indigo-600">
                  <FiUsers />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-xl p-6  shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">
                    Người dùng bị khóa
                  </div>
                  <div className="text-xl font-semibold mt-1">
                    {totalBannedUsers}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-indigo-50 text-indigo-600">
                  <FiUsers />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-xl p-6  shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Đang hoạt động</div>
                  <div className="text-xl font-semibold mt-1">
                    {totalIsActiveUsers}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-yellow-50 text-yellow-600">
                  <FiCompass />
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow border-2 border-gray-300 w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Doanh thu theo tháng</h3>
              </div>
              <div className="flex items-end gap-3 h-36">
                {revenueTrend.map((val, i) => {
                  const max = Math.max(...revenueTrend);
                  const height = Math.max(0, Math.round((val / max) * 120));
                  return (
                    <div key={i} className="flex-1 relative group">
                      <div className="h-full flex items-end justify-center">
                        <div
                          className="w-6 rounded-t-md bg-gradient-to-b from-emerald-400 to-emerald-500 transition-all duration-500"
                          style={{ height }}
                        ></div>
                      </div>

                      <div className="absolute bottom-[calc(100%+0.25rem)] left-1/2 -translate-x-1/2 text-[11px] opacity-0 text-gray-600 group-hover:opacity-100 transition-opacity">
                        {val.toLocaleString("vi-VN")}đ
                      </div>

                      <div className="text-xs text-center text-gray-600 font-bold mt-2">
                        T{i + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="col-span-1 bg-white p-6 rounded-2xl shadow border-2 border-gray-300">
              <h4 className="font-semibold text-[20px] text-gray-800 tracking-tight mb-4">
                Sản phẩm bán chạy
              </h4>
              <ul className="space-y-3">
                {topProducts.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                        <img
                          src={p.variants?.[0]?.image?.url || "/no-image.png"}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm line-clamp-1">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.store.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600">
                        {currency(p.variants[0].price)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Đã bán {p.tradedCount}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 bg-white p-6 rounded-2xl shadow border-2 border-gray-300">
              <h4 className="font-semibold text-[20px] text-gray-800 tracking-tight mb-6">
                Đơn hàng gần đây
              </h4>
              <ul className="space-y-3">
                {recentOrders.map((o) => (
                  <li key={o._id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{o.contact.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        Mã đơn: {o._id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {currency(o.final_amount)}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          o.status === "Hoàn tất"
                            ? "text-green-600"
                            : o.status === "Pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {o.status === "Pending"
                          ? "Đang xử lý"
                          : o.status === "Cancelled"
                          ? "Đã hủy"
                          : "Thành công"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 bg-white p-6 rounded-2xl shadow border-2 border-gray-300">
              <h4 className="font-semibold text-[20px] text-gray-800 tracking-tight mb-4">
                Top cửa hàng
              </h4>
              <ol className="space-y-3">
                {topStores.map((s, idx) => (
                  <li
                    key={s.storeId}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold text-sm">
                        {idx + 1}
                      </div>

                      <div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {s.storeName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {s.orders
                            ? `${s.orders} đơn hàng`
                            : "Chưa có đơn hàng"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600">
                        {currency(s.totalPayment)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Doanh thu
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
