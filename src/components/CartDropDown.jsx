import { useEffect, useState } from "react";
import api from "../utils/api";

function CartDropdown({ store, onCartChange }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  // Dùng trực tiếp store.Item thay vì local state
  const items = store.Item || [];

  // Debug: Log items để xem data
  console.log("🔍 CartDropdown - Store:", store._id);
  console.log(
    "🔍 Items:",
    items.map((i) => ({
      id: i._id,
      unitPrice: i.unitPrice,
      finalPrice: i.finalPrice,
      discountValue: i.discountValue,
      is_chosen: i.is_chosen,
    }))
  );

  const toggleDropdown = () => setIsOpen(!isOpen);

  const increaseQuantity = async (id) => {
    try {
      // Không update state trước, chờ API response
      await api.post("/cart/increase", { cartItemId: id });
      onCartChange(); // Fetch lại data từ server
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id) => {
    try {
      await api.post("/cart/remove", { cartItemId: id });
      onCartChange(); // Fetch lại data từ server
    } catch (err) {
      console.error(err);
    }
  };

  const decreaseQuantity = async (id) => {
    try {
      const item = items.find((i) => i._id === id);
      if (item.quantity <= 1) return;

      // Không update state trước, chờ API response
      await api.post("/cart/reduce", { cartItemId: id });
      onCartChange(); // Fetch lại data từ server
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = async (id) => {
    try {
      // Lấy trạng thái hiện tại của item
      const item = items.find((i) => i._id === id);
      if (!item) return;

      // Toggle trạng thái
      const newSelected = !item.is_chosen;

      // Gửi trạng thái mới lên backend
      await api.post("/cart/change", {
        cartItemId: id,
        is_chosen: newSelected,
      });
      onCartChange(); // Fetch lại data từ server
    } catch (err) {
      console.error("Lỗi toggleSelect:", err);
    }
  };

  const allSelected = items.every((item) => item.is_chosen);

  const toggleSelectAll = async () => {
    try {
      const newState = !allSelected;

      // Gọi API cho từng item
      await Promise.all(
        items.map((item) =>
          api.post("/cart/change", {
            cartItemId: item._id,
            is_chosen: newState,
          })
        )
      );
      onCartChange(); // Fetch lại data từ server
    } catch (err) {
      console.error(err);
    }
  };

  // const [availablePromotions, setAvailablePromotions] = useState([]);

  // const handleSelectPromotion = async (promo) => {
  //   try {
  //     await api.post("/cart/add-promotion", { promotion_id: promo._id });
  //     setShowPromotionModal(false);
  //     console.log("Promotion applied:", promo);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  return (
       <>
      <div className="border-3 border-blue-300 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-md p-5 mb-5 transition-all hover:shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center w-full font-semibold cursor-pointer">
          {/* Checkbox + Avatar + StoreName */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={allSelected}
              onClick={(e) => e.stopPropagation()}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-blue-600"
            />
            <div
              className="flex items-center space-x-2"
              onClick={toggleDropdown}
            >
              <img
                src={store.store_id.user.avatar}
                alt={store.store_id.name}
                className="w-10 h-10 object-cover rounded-full border border-blue-300 shadow-sm"
              />
              <span className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">
                {store.store_id.name}
              </span>
            </div>
          </div>

          {/* Dropdown arrow */}
          <span
            className="cursor-pointer text-blue-600 text-lg"
            onClick={toggleDropdown}
          >
            {isOpen ? "▲" : "▼"}
          </span>
        </div>

        {/* Content */}
        {isOpen && (
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-white border-2 border-blue-300 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                {/* Checkbox + Image + Info */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={item.is_chosen}
                    onChange={() => toggleSelect(item._id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <img
                    src={item.variant_id.image.url}
                    alt={item.variant_id.product_id.name}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.variant_id.product_id.name} -{" "}
                      <span className="text-gray-600">
                        {item.variant_id.size.size_value} -{" "}
                        {item.variant_id.image.color}
                      </span>
                    </p>
                    <p className="text-sm text-blue-600 font-semibold">
                      {item.unitPrice.toLocaleString()}₫
                    </p>
                  </div>
                </div>

                {/* Quantity + TotalPrice */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => decreaseQuantity(item._id)}
                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition"
                  >
                    -
                  </button>
                  <span className="font-medium text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increaseQuantity(item._id)}
                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition"
                  >
                    +
                  </button>
                  <div className="ml-4 text-right min-w-[90px]">
                    {item.discountValue && item.discountValue !== 0 ? (
                      <>
                        <p className="text-gray-400 line-through text-sm">
                          {(item.unitPrice * item.quantity).toLocaleString()}₫
                        </p>
                        <p className="font-semibold text-blue-700">
                          {(
                            item.finalPrice || item.unitPrice * item.quantity
                          ).toLocaleString()}
                          ₫
                        </p>
                      </>
                    ) : (
                      <p className="font-semibold text-blue-700">
                        {(
                          item.finalPrice || item.unitPrice * item.quantity
                        ).toLocaleString()}
                        ₫
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-300 rounded-md 
             hover:bg-red-100 hover:text-red-700 transition-all duration-200 shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 7h12M9 7V4h6v3m2 0v13a2 2 0 01-2 2H8a2 2 0 01-2-2V7z"
                      />
                    </svg>
                    <span className="font-medium text-sm">Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default CartDropdown;
