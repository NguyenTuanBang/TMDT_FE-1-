import React, { useState } from "react";
import { FiUsers, FiPackage, FiDollarSign, FiCompass } from "react-icons/fi";

import { Chip } from "@heroui/react";
import useOrders from "../hooks/useOrder";
import useUsers from "../hooks/useUsers";
import useStores from "../hooks/useStore";
import useProducts from "../hooks/useProduct";
import useAuth from "../hooks/useAuth";

export default function SellerDashboard() {
  const [filters] = useState({
    search: "",
    role: "",
    isActive: "",
    page: 1,
    limit: 10,
  });

  const statusColorMap = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
  };

  const { user } = useAuth();
  const { data: orders } = useOrders();
  const { data: users } = useUsers(filters);
  const { data: stores } = useStores();
  const { data: products } = useProducts();

  if (!orders || !users || !stores || !products) return;

  const store = stores.find((store) => store.user._id === user._id);

  const product = products.filter((product) => product.store_id === store._id);

  const ordersOfStore = orders.reduce((acc, order) => {
    const storeInOrder = order.orderStore.filter(
      (s) => s.store._id === store._id
    );

    if (storeInOrder.length > 0) {
      acc.push({ ...order, orderStore: storeInOrder });
    }

    return acc;
  }, []);

  console.log(ordersOfStore);

  const totalPayment = ordersOfStore.reduce(
    (acc, order) => (acc += order.orderStore[0].finalTotal),
    0
  );

  const currency = (n) => n.toLocaleString("vi-VN") + "₫";

  const revenueTrend = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const total = ordersOfStore
      .filter((order) => {
        const created = new Date(order.createdAt);
        const year = created.getFullYear();
        return (
          year === new Date().getFullYear() && created.getMonth() + 1 === month
        );
      })
      .reduce((sum, order) => sum + (order.orderStore[0].finalTotal || 0), 0);
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
                  <div className="text-xs text-gray-500">Tổng Doanh thu</div>
                  <div className="text-xl font-semibold mt-1">
                    {currency(totalPayment)}
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
                    {ordersOfStore.length}
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
                  <div className="text-xs text-gray-500">Tổng số sản phẩm</div>
                  <div className="text-xl font-semibold mt-1">
                    {product.length}
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
                  <div className="text-xs text-gray-500">Trạng thái</div>
                  <div className="text-xl font-semibold mt-1">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={statusColorMap[store.status] || "default"}
                      className="capitalize"
                    >
                      {store.status === "approved"
                        ? "Đang hoạt động"
                        : store.status === "pending"
                        ? "Chờ duyệt"
                        : "Ngưng hoạt động"}
                    </Chip>
                  </div>
                </div>
                <div className="p-3 rounded-md bg-indigo-50 text-indigo-600">
                  <FiUsers />
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
        </main>
      </div>
    </div>
  );
}
