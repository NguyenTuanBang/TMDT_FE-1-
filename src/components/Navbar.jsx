import { BellIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import LanguageDropDown from "./LanguageDropDown.jsx";
import useAuth from "../hooks/useAuth.jsx";
import MeDropDown from "./MeDropDown.jsx";
import { useRef, useState } from "react";
import { useEffect } from "react";
import api from "../utils/api.jsx";
import axios from "axios";
import { useCartCount } from "../hooks/useCartCount.jsx";
import NotificationDropdown from "./Notification.jsx";

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: cartCount, isLoading } = useCartCount();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

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

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const [numberOfItem, setNumberOfItem] = useState(0)
  // const [onDisplay, setOndisplay] = useState(false)

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // useEffect(() => {
  //   const fetchQuantityOfItems = async () => {
  //     const res = await api.get(`/cart/count`)
  //     setNumberOfItem(res.data.data)
  //     setOndisplay(res.data.data !== 0)
  //   }
  //   fetchQuantityOfItems()
  // }, [])

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setTotalCount(0);
      setShowDropdown(false);
      return;
    }
    const fetchData = async () => {
      try {
        const res = await axios.get(
          // `${
          //   import.meta.env.VITE_LOCAL_PORT
          // }/products/search?keyword=${keyword}`
          `${
            import.meta.env.VITE_DEPLOY_PORT
          }/products/search?keyword=${keyword}`
        );
        setResults(res.data.data);
        setTotalCount(res.data.totalResults);
        setShowDropdown(true);
      } catch (error) {
        console.error(error);
      }
    };
    const timeout = setTimeout(fetchData, 400);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const languageOptions = [
    { key: "vi", label: "Tiếng Việt" },
    { key: "en", label: "English" },
  ];

  const meOptions = [
    { key: "me", label: "Tài khoản của tôi" },
    { key: "order", label: "Đơn hàng" },
    { key: "logout", label: "Đăng xuất" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-2 w-full bg-gradient-to-r from-green-400 via-blue-500 to-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 text-white">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold tracking-wide flex justify-center items-center">
              <img src="/logo.png" className="w-12 h-12" alt="" />
              <p>TMDT</p>
            </div>
            <div className="hidden md:flex gap-2 font-medium text-large">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg hover:bg-white/20 transition cursor-pointer"
              >
                Trang Chủ
              </Link>
              <Link
                to="/products"
                className="px-3 py-2 rounded-lg hover:bg-white/20 transition cursor-pointer"
              >
                Sản Phẩm
              </Link>
            </div>
          </div>

          {/* <div className="flex-1 mx-6 hidden md:block">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-2 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            {showDropdown && (
              <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 z-50 max-h-60 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-3 text-gray-500">Not Found</div>
                ) : (
                  <>
                    {results.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer w-[30%]"
                        onClick={() => {
                          navigate(`/product/${item._id}`);
                          setShowDropdown(false);
                          setKeyword("");
                        }}
                      >
                        <img
                          src={item.mainImage.url || "./default.jpg"}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-gray-800">{item.name}</span>
                      </div>
                    ))}
                    {totalCount > 5 && (
                      <div
                        className="p-3 text-blue-600 font-medium text-center border-t cursor-pointer hover:bg-blue-50"
                        onClick={() => navigate(`/listProduct?name=${keyword}`)}
                      >
                        Xem thêm {totalCount - 5} sản phẩm...
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div> */}
          <div className="flex-1 mx-6 hidden md:block relative">
            <div className="relative w-full">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && keyword.trim()) {
                    navigate(
                      `/products?name=${encodeURIComponent(keyword.trim())}`
                    );
                    setShowDropdown(false);
                    setKeyword("");
                  }
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />

              {showDropdown && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="p-3 text-gray-500">
                      Không tìm thấy sản phẩm
                    </div>
                  ) : (
                    <>
                      {results.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            navigate(`/products/${item._id}`);
                            setShowDropdown(false);
                            setKeyword("");
                          }}
                        >
                          <img
                            src={item.mainImage.url || "./default.jpg"}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="text-gray-800 ml-2">
                            {item.name}
                          </span>
                        </div>
                      ))}
                      {totalCount >= 5 && (
                        <div
                          className="p-3 text-blue-600 font-medium text-center border-t cursor-pointer hover:bg-blue-50"
                          onClick={() => {
                            setKeyword("");
                            setShowDropdown(false);
                            navigate(`/products?name=${keyword}`);
                          }}
                        >
                          Xem thêm {totalCount - 4} sản phẩm...
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
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

            <div className="p-6">
              <LanguageDropDown options={languageOptions} defaultValue="vi" />
            </div>

            <div className="p-6">
              {user ? (
                <MeDropDown options={meOptions} />
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/authen/login"
                    className="px-4 py-2 rounded-full border border-white/70 text-white font-medium 
               hover:bg-white/20 transition duration-300 shadow-sm"
                  >
                    Đăng nhập
                  </Link>

                  <Link
                    to="/authen/signup"
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-200 to-blue-300 
               text-indigo-900 font-semibold hover:from-indigo-300 hover:to-blue-400 
               transition duration-300 shadow"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/20 transition cursor-pointer">
              <Link to="/cart">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
                {cartCount > 0 && !isLoading && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
