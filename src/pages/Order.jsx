import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth.jsx";
import api from "../utils/api.jsx";
import Navbar from "../components/Navbar.jsx";
import CustomModal from "./Modal.jsx";
import CustomSelect from "./CustomSelect.jsx";
import { useDisclosure, Button, Input } from "@heroui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAddress from "../hooks/useAdress.jsx";
import useToast from "../hooks/useToast.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Order = () => {
  const user = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const { addAddress } = useAddress();
  const [chosenAddress, setChosenAddress] = useState({});
  const [listAddress, setListAdress] = useState([]);
  const [preOrder, setPreOrder] = useState({});
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const fetchData = async () => {
    const res = await api.get("/users/me/address");
    const resAddress = res.data.data;
    setListAdress(resAddress.filter((item) => item.isDefault === false));
    setChosenAddress(resAddress.find((item) => item.isDefault));
    if (resAddress.length === 0) {
      handleOpen();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPreOrder = async (addressId) => {
    if (chosenAddress) {
      await api.post("/cart/shippingFee", { addressId });
      const res = await api.get("/cart/preOrder");
      setPreOrder(res.data.data);
    } else {
      handleOpen();
    }
  };

  useEffect(() => {
    if (chosenAddress && chosenAddress._id) fetchPreOrder(chosenAddress._id);
  }, [chosenAddress]);

  const chooseNewAddress = (id) => {
    const newChosen = listAddress.find((item) => item._id === id);
    const newList = [
      ...listAddress.filter((item) => item._id !== id),
      chosenAddress,
    ];
    setChosenAddress(newChosen);
    setListAdress(newList);
    setIsAddressDropdownOpen(false);
  };

  const onPaymentMutation = useMutation({
    mutationFn: async () => {
      return await api.post("/orders", { address: chosenAddress._id });
    },
    onSuccess: () => {
      toast.success("Thành công", "Vui lòng ấn vào giỏ hàng để xem thêm");
      navigate("/");
      queryClient.invalidateQueries(["cartCount"]);
    },
    onError: (err) => {
      toast.error("Lỗi", "Vui lòng thử lại");
      console.error(err);
    },
  });

  const onPayment = () => {
    onPaymentMutation.mutate();
  };

  const handleOpen = async () => {
    try {
      if (provinces.length === 0) {
        const res = await axios.get("https://provinces.open-api.vn/api/p/");
        const data = res.data.map((p) => ({
          label: p.name,
          value: p.code,
          name: p.name,
        }));
        setProvinces(data);
      }
      onOpen();
    } catch (err) {
      console.error("Lỗi load tỉnh:", err);
    }
  };

  const fetchDistricts = async (provinceCode, setFieldValue) => {
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = res.data.districts.map((d) => ({
        label: d.name,
        value: d.code,
        name: d.name,
      }));

      setDistricts(data);
      setWards([]);
      setFieldValue("district", "");
      setFieldValue("ward", "");
    } catch (err) {
      console.error("Lỗi load huyện:", err);
    }
  };

  const fetchWards = async (districtCode, setFieldValue) => {
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = res.data.wards.map((w) => ({
        label: w.name,
        value: w.code,
        name: w.name,
      }));
      setWards(data);
      setFieldValue("ward", "");
    } catch (err) {
      console.error("Lỗi load xã:", err);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Vui lòng nhập tên"),
    phone: Yup.string()
      .matches(/^(0|\+84)(\d{9})$/, "Số điện thoại không hợp lệ")
      .required("Vui lòng nhập số điện thoại"),
    province: Yup.string().required("Vui lòng chọn tỉnh/thành phố"),
    district: Yup.string().required("Vui lòng chọn quận/huyện"),
    ward: Yup.string().required("Vui lòng chọn xã/phường"),
    detail: Yup.string().required("Vui lòng nhập địa chỉ"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    const province = provinces.find((p) => p.value == values.province)?.name;
    const district = districts.find((d) => d.value == values.district)?.name;
    const ward = wards.find((w) => w.value == values.ward)?.name;

    const parts = [
      values.detail?.trim(),
      ward,
      district,
      province,
      "Việt Nam",
    ].filter(Boolean);
    const fullAddress = parts.join(", ");

    // Nếu chưa có tọa độ => xác nhận địa chỉ
    if (!coordinates) {
      try {
        setLoadingGeo(true);
        const res = await api.get(`/geocode?address=${encodeURIComponent(fullAddress)}`);
        console.log("📍 Gửi geocode:", fullAddress);
        console.log("📦 Trả về:", res.data);
        setCoordinates(res.data);
        toast.success("Thành công", "Đã tìm thấy tọa độ! Xác nhận lại để lưu.");
      } catch (err) {
        toast.error("Lỗi", "Không tìm thấy tọa độ");
        console.error(err);
      } finally {
        setLoadingGeo(false);
      }
      return;
    }

    // Nếu đã có tọa độ => gửi BE
    const finalValues = {
      ...values,
      province,
      district,
      ward,
      lat: coordinates.lat,
      lng: coordinates.lng,
    };

    addAddress.mutate(finalValues, {
      onSuccess: () => {
        resetForm();
        setCoordinates(null);
        onOpenChange(false);
        fetchData();
        setIsAddressDropdownOpen(false);
        toast.success("Thành công", "Bạn đã thêm một địa chỉ mới");
      },
      onError: (err) => {
        console.error(err);
      },
    });
  };

  const handleClose = (resetForm) => {
    resetForm();
    setCoordinates(null);
    onOpenChange(false);
  };

  const formNewAddress = () => {
    return (
      <Formik
        initialValues={{
          name: "",
          phone: "",
          detail: "",
          province: "",
          district: "",
          ward: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, resetForm, setFieldValue, values }) => (
          <Form id="address-form" onSubmit={handleSubmit}>
            <CustomModal
              isOpen={isOpen}
              onClose={() => handleClose(resetForm)}
              title="Nhập thông tin địa chỉ"
              confirmText={coordinates ? "Lưu địa chỉ" : "Xác nhận địa chỉ"}
              cancelText="Đóng"
              formId="address-form"
              confirmProps={{ isLoading: loadingGeo }}
            >
              <div className="space-y-4">
                <Field
                  as={Input}
                  name="name"
                  label="Tên"
                  placeholder="Nhập tên của bạn"
                  variant="bordered"
                  onChange={(e) => {
                    setFieldValue("name", e.target.value);
                    setCoordinates(null);
                  }}
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />

                <Field
                  as={Input}
                  name="phone"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  variant="bordered"
                  onChange={(e) => {
                    setFieldValue("phone", e.target.value);
                    setCoordinates(null);
                  }}
                />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />

                <Field name="province">
                  {({ field, form }) => (
                    <CustomSelect
                      label="Tỉnh/Thành phố"
                      placeholder="Chọn tỉnh"
                      options={provinces}
                      value={field.value}
                      onChange={(val) => {
                        form.setFieldValue("province", val);
                        setCoordinates(null);
                        fetchDistricts(val, form.setFieldValue);
                      }}
                    />
                  )}
                </Field>

                <Field name="district">
                  {({ field, form }) => (
                    <CustomSelect
                      label="Quận/Huyện"
                      placeholder="Chọn quận/huyện"
                      options={districts}
                      value={field.value}
                      onChange={(val) => {
                        form.setFieldValue("district", val);
                        setCoordinates(null);
                        fetchWards(val, form.setFieldValue);
                      }}
                    />
                  )}
                </Field>

                <Field name="ward">
                  {({ field, form }) => (
                    <CustomSelect
                      label="Xã/Phường"
                      placeholder="Chọn xã/phường"
                      options={wards}
                      value={field.value}
                      onChange={(val) => {
                        form.setFieldValue("ward", val);
                        setCoordinates(null);
                      }}
                    />
                  )}
                </Field>

                <Field
                  as={Input}
                  name="detail"
                  label="Địa chỉ cụ thể"
                  placeholder="Nhập địa chỉ cụ thể của bạn"
                  variant="bordered"
                  onChange={(e) => {
                    setFieldValue("detail", e.target.value);
                    setCoordinates(null);
                  }}
                />
                <ErrorMessage name="detail" component="div" className="text-red-500 text-sm" />

                {coordinates && (
                  <div className="mt-6 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Vị trí của bạn</h3>
                    <iframe
                      title="map"
                      width="100%"
                      height="300"
                      style={{ border: 0, borderRadius: "8px" }}
                      src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`}
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </CustomModal>
          </Form>
        )}
      </Formik>
    );
  };

  return (
       <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 mt-[70px]">
        <h2 className="text-3xl text-center font-bold text-blue-500 mb-4 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 p-3 rounded-xl shadow-md">
          Xác nhận đơn hàng
        </h2>
        {/* 🏠 Phần chọn địa chỉ */}
        <div className="relative mb-8">
          <div
            className="border-3 border-blue-300 p-4 rounded-xl flex justify-between items-center cursor-pointer bg-gradient-to-r from-blue-50 to-white shadow-md hover:shadow-lg transition"
            onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
          >
            {chosenAddress ? (
              <>
                <div className="flex-shrink-0 w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-start items-start font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-sm leading-relaxed">
                  {/* Tên người nhận */}
                  <p className="font-semibold text-gray-900 text-base tracking-wide mb-1">
                    {chosenAddress.name}
                  </p>

                  {/* Địa chỉ chi tiết */}
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold text-gray-800">
                      Địa chỉ:
                    </span>{" "}
                    <span className="font-semibold text-gray-700">
                      {chosenAddress.detail}, {chosenAddress.ward},{" "}
                      {chosenAddress.district}, {chosenAddress.province}
                    </span>
                  </p>

                  {/* Số điện thoại */}
                  <p className="font-semibold text-gray-500">
                    Số điện thoại: {chosenAddress.phone}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-400 italic">Chưa có địa chỉ được chọn</p>
            )}
            <span className="text-gray-500 font-semibold">
              {isAddressDropdownOpen ? "▲" : "▼"}
            </span>
          </div>

          {/* Dropdown địa chỉ */}
          {isAddressDropdownOpen && (
            <div className="absolute z-20 w-full bg-white border border-blue-200 mt-2 rounded-2xl shadow-lg max-h-60 overflow-y-auto transition-all duration-200 animate-fadeIn backdrop-blur-sm">
              {/* Danh sách địa chỉ */}
              {listAddress.length > 0 &&
                listAddress
                  .filter((addr) => addr._id !== chosenAddress?._id)
                  .map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => chooseNewAddress(addr._id)}
                      className="p-3.5 hover:bg-gradient-to-r from-blue-50 to-blue-100 cursor-pointer transition-all duration-200 flex items-start gap-3 border-b-2 border-gray-300 last:border-none "
                    >
                      {/* Icon avatar đại diện địa chỉ */}
                      <div className="flex-shrink-0 w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z"
                          />
                        </svg>
                      </div>

                      {/* Nội dung địa chỉ */}
                      <div className="flex-1 text-sm leading-relaxed">
                        {/* Hàng 1: Tên người nhận */}
                        <p className="font-semibold text-gray-900 text-base tracking-wide mb-1">
                          {addr.name}
                        </p>

                        {console.log(addr)}
                        {/* Hàng 2: Địa chỉ chi tiết */}
                        <p className="text-gray-700 mb-1">
                          <span className="font-semibold text-gray-800">
                            Địa chỉ:
                          </span>{" "}
                          <span className="font-semibold text-gray-700">
                            {addr.detail}, {addr.ward}, {addr.district},{" "}
                            {addr.province}
                          </span>
                        </p>

                        {/* Hàng 3: Số điện thoại */}
                        <p className="font-semibold text-gray-500">
                          Số điện thoại: {addr.phone}
                        </p>
                      </div>
                    </div>
                  ))}

              {/* Thêm địa chỉ mới */}
              <div className="p-3 text-center border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-white rounded-b-2xl">
                <Button
                  color="primary"
                  onPress={handleOpen}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:opacity-90 transition-all duration-200 px-5 py-2"
                >
                  + Thêm địa chỉ mới
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ⚠️ Nếu chưa có địa chỉ */}
        {!chosenAddress && (
          <div className="border border-gray-200 p-6 rounded-xl shadow-md bg-gradient-to-r from-gray-50 to-white text-center text-gray-600">
            <p>
              Chưa có địa chỉ. Hãy thêm địa chỉ giao hàng trước khi đặt hàng.
            </p>
          </div>
        )}

        {/* 🏬 Danh sách đơn hàng */}
        {chosenAddress && preOrder?.Store && preOrder.Store.length > 0 && (
          <div className="space-y-6 overflow-y-auto max-h-[80%]">
            {preOrder.Store.map((store) => (
              <div
                key={store._id}
                className="border-2 border-blue-400 rounded-xl shadow-md bg-white p-4 hover:shadow-lg transition"
              >
                {/* Header cửa hàng */}
                <div className="flex items-center space-x-3 border-b border-gray-100 pb-3 mb-3">
                  <img
                    src={store.store_id.user.avatar}
                    alt={store.store_id.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {store.store_id.name}
                    </p>
                    {store.shippingFee !== undefined && (
                      <p className="text-sm text-gray-500">
                        Phí giao hàng:{" "}
                        <span className="font-medium text-blue-600">
                          {store.shippingFee.toLocaleString()}₫
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="space-y-2">
                  {store.Item.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center border-2 border-blue-300 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.variant_id.image.url}
                          alt={item.variant_id.product_id.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.variant_id.product_id.name} -{" "}
                            {item.variant_id.size.size_value} -{" "}
                            {item.variant_id.image.color}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Đơn giá:{" "}
                            <span className="text-gray-700 font-medium">
                              {item.unitPrice.toLocaleString()}₫
                            </span>{" "}
                            × {item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Tổng tiền sản phẩm */}
                      <div className="text-right">
                        {item.discountValue && item.discountValue !== 0 ? (
                          <>
                            <p className="text-gray-400 line-through text-sm">
                              {(
                                item.unitPrice * item.quantity
                              ).toLocaleString()}
                              ₫
                            </p>
                            <p className="font-semibold text-red-600">
                              {item.finalPrice.toLocaleString()}₫
                            </p>
                          </>
                        ) : (
                          <p className="font-semibold text-blue-600">
                            {(
                              item.finalPrice || item.unitPrice * item.quantity
                            ).toLocaleString()}
                            ₫
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Khuyến mãi */}
                {store.promotion && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-700">
                    🎁 Khuyến mãi áp dụng: <b>{store.promotion.name}</b> –{" "}
                    {store.promotion.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 💰 Tổng tiền + nút mua hàng */}
        {preOrder && preOrder.Store && (
          <div className="mt-10 border-t border-gray-200 pt-5 flex justify-between items-center bg-gradient-to-r from-blue-200 to-blue-100 rounded-xl p-4 shadow-md">
            <div className="text-lg font-semibold text-gray-800">
              Tổng tiền:{" "}
              <span className="text-blue-500 text-2xl font-bold">
                {preOrder.finalTotal?.toLocaleString() || 0}₫
              </span>
            </div>
            <button
              onClick={() => onPayment()}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition-all active:scale-95"
            >
              Mua hàng
            </button>
          </div>
        )}
      </div>

      {/* Modal thêm địa chỉ */}
      {formNewAddress()}
    </>
  )}

export default Order