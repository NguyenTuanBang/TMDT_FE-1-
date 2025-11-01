import useAuth from "../hooks/useAuth";
import useOrders from "../hooks/useOrder";
import useProduct from "../hooks/useProduct";
import useStores from "../hooks/useStore";
import {
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaCalendarAlt,
  FaMedal,
  FaMoneyBill,
  FaStore,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUsers,
  FaBoxOpen,
  FaClipboardList,
} from "react-icons/fa";
import { useParams } from "react-router-dom";

function StoreSeller() {
  const { storeId } = useParams();
  const { data: products } = useProduct();
  const { user } = useAuth();
  const { data: stores } = useStores();
  const { data: orders } = useOrders();

  if (!stores || !user || !products || !orders) return <div>Đang tải...</div>;

  const store = storeId
    ? stores.find((store) => store._id === storeId)
    : stores.find((store) => store.user._id === user._id);

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

  const totalPayment = ordersOfStore.reduce(
    (acc, order) => (acc += order.orderStore[0].finalTotal),
    0
  );

  const uniqueCustomers = orders.reduce((acc, order) => {
    const customer = order.contact; // mỗi order có contact

    // kiểm tra xem khách này đã có trong acc chưa
    if (!acc.some((c) => c.user === customer.user)) {
      acc.push(customer);
    }

    return acc;
  }, []);

  if (!store) return <div>Không tìm thấy thông tin cửa hàng</div>;

  const stats = [
    {
      title: "Tổng khách hàng",
      value: uniqueCustomers.length,
      icon: <FaUsers className="text-blue-600 text-2xl" />,
    },
    {
      title: "Tổng đơn hàng",
      value: ordersOfStore.length || 0,
      icon: <FaClipboardList className="text-orange-500 text-2xl" />,
    },
    {
      title: "Tổng sản phẩm",
      value: product.length || 0,
      icon: <FaBoxOpen className="text-purple-500 text-2xl" />,
    },
    {
      title: "Tổng thanh toán",
      value: `${(totalPayment || 0).toLocaleString()}₫`,
      icon: <FaMoneyBill className="text-green-500 text-2xl" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header thông tin cửa hàng */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-gray-300 px-10 py-10 shadow-lg">
        <div className="flex items-center gap-8">
          <img
            src={store.user.avatar}
            alt="Avatar shop"
            className="w-48 h-48 rounded-full object-cover border-4 border-gray-300 shadow-xl"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {store.name}
            </h1>
            <p className="flex items-center gap-2 text-gray-700 text-lg">
              <FaMapMarkerAlt /> {store.address}
            </p>
            <p className="flex items-center gap-2 text-gray-700 mt-1 text-lg">
              <FaPhoneAlt /> {store.phone}
            </p>
            <p
              className={`text-sm font-semibold mt-3 px-3 py-1 rounded-full inline-block border border-gray-300 shadow-sm ${
                store.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : store.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {store.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
            </p>
          </div>
        </div>
      </div>

      {/* Thống kê tổng hợp */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 p-10 bg-gray-50">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border-2 border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="mb-3">{item.icon}</div>
            <p className="text-3xl font-bold text-gray-800">{item.value}</p>
            <p className="text-sm text-gray-600">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Thông tin chi tiết cửa hàng */}
      <div className="bg-white px-10 py-10 border-t-2 border-gray-300 shadow-inner">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-8">
          <FaStore className="text-blue-600" /> Thông tin cửa hàng
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: <FaCalendarAlt className="text-orange-500 text-xl" />,
              label: "Ngày tạo cửa hàng",
              value: new Date(store.createdAt).toLocaleDateString("vi-VN"),
            },
            {
              icon: <FaPhoneAlt className="text-green-500 text-xl" />,
              label: "Số điện thoại",
              value: store.phone,
            },
            {
              icon: <FaMapMarkerAlt className="text-blue-500 text-xl" />,
              label: "Địa chỉ",
              value: (() => {
                if (!store.address) return "";
                const parts = store.address
                  .split(",")
                  .map((part) => part.trim());
                return parts.length > 0 ? parts[parts.length - 1] : "";
              })(),
            },
          ].map((info, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-50 p-5 rounded-lg border-2 border-gray-300 shadow-md hover:shadow-lg transition"
            >
              {info.icon}
              <div>
                <p className="text-sm text-gray-500">{info.label}</p>
                <p className="font-medium text-gray-800">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thông tin người bán */}
      <div className="bg-gray-50 px-10 py-12 border-t-2 border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <FaUser className="text-indigo-600" /> Thông tin người bán
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              icon: <FaUser className="text-indigo-500 text-xl" />,
              label: "Tên người bán",
              value: store.user.fullname,
            },
            {
              icon: <FaIdCard className="text-blue-500 text-xl" />,
              label: "Số CCCD",
              value: store.citizenCode || "Chưa cập nhật",
            },
            {
              icon: <FaEnvelope className="text-purple-500 text-xl" />,
              label: "Email",
              value: store.user.email,
            },
            {
              icon: <FaUser className="text-indigo-500 text-xl" />,
              label: "Tên tài khoản người bán",
              value: store.user.username,
            },
          ].map((info, i) => (
            <div
              key={i}
              className="flex items-center  gap-3 bg-white p-5 rounded-lg border-2 border-gray-300 shadow-md hover:shadow-lg transition"
            >
              {info.icon}
              <div>
                <p className="text-sm text-gray-500">{info.label}</p>
                <p className="font-medium text-gray-800">{info.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            📷 Ảnh CCCD
          </h3>
          <div className="flex flex-wrap gap-6">
            <img
              src={store.citizenImageFront}
              alt="CCCD mặt trước"
              className="w-64 h-40 object-cover border-2 border-gray-300 rounded-md shadow-lg hover:shadow-2xl transition"
            />
            <img
              src={store.citizenImageBack}
              alt="CCCD mặt sau"
              className="w-64 h-40 object-cover border-2 border-gray-300 rounded-md shadow-lg hover:shadow-2xl transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreSeller;
