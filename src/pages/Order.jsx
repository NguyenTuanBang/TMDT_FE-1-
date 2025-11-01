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
      <div className="max-w-4xl mx-auto p-4 mt-[60px]">
        {/* Phần chọn địa chỉ */}
        <div className="relative mb-6">
          <div
            className="border p-3 rounded-lg flex justify-between items-center cursor-pointer bg-white shadow-sm"
            onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
          >
            {chosenAddress ? (
              <div>
                <p className="font-semibold">{chosenAddress.name}</p>
                <p className="text-gray-600 text-sm">{chosenAddress.phone}</p>
                <p className="text-gray-500 text-sm">
                  {chosenAddress.specificAddress} {chosenAddress.ward},{" "}
                  {chosenAddress.district}, {chosenAddress.province}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 italic">Chưa có địa chỉ được chọn</p>
            )}
            <span>{isAddressDropdownOpen ? "▲" : "▼"}</span>
          </div>

          {isAddressDropdownOpen && (
            <div className="absolute z-10 w-full bg-white border mt-2 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {listAddress.length > 0 &&
                listAddress
                  .filter((addr) => addr._id !== chosenAddress?._id)
                  .map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => chooseNewAddress(addr._id)}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <p className="font-semibold">{addr.name}</p>
                      <p className="text-gray-600 text-sm">{addr.phone}</p>
                      <p className="text-gray-500 text-sm truncate">
                        {addr.specificAddress} {addr.ward}, {addr.district},{" "}
                        {addr.province}
                      </p>
                    </div>
                  ))}
              <div className="p-3 text-center text-blue-500 cursor-pointer hover:underline">
                <Button color="primary" onPress={handleOpen}>
                  + Thêm địa chỉ mới
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Nếu chưa có địa chỉ */}
        {!chosenAddress && (
          <div className="border p-6 rounded-lg shadow bg-gray-50 text-center text-gray-600">
            <p>Chưa có địa chỉ. Hãy thêm địa chỉ giao hàng trước khi đặt hàng.</p>
          </div>
        )}

        {/* Hiển thị đơn hàng theo cửa hàng */}
        {chosenAddress && preOrder?.Store && preOrder.Store.length > 0 && (
          <div className="space-y-6 overflow-y-auto max-h-[80%]">
            {preOrder.Store.map((store) => (
              <div key={store._id} className="border rounded-lg shadow p-4 bg-white">
                <div className="flex items-center space-x-3 border-b pb-2 mb-3">
                  <img
                    src={store.store_id.user.avatar}
                    alt={store.store_id.name}
                    className="w-10 h-10 rounded"
                  />
                  <div>
                    <p className="font-semibold">{store.store_id.name}</p>
                    {store.shippingFee !== undefined && (
                      <p className="text-sm text-gray-500">
                        Phí giao hàng: {store.shippingFee.toLocaleString()}₫
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {store.Item.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center border rounded p-2"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.variant_id.image.url}
                          alt={item.variant_id.product_id.name}
                          className="w-14 h-14 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">
                            {item.variant_id.product_id.name} -{" "}
                            {item.variant_id.size.size_value} -{" "}
                            {item.variant_id.image.color}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Đơn giá: {item.unitPrice.toLocaleString()}₫ ×{" "}
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.discountValue && item.discountValue !== 0 ? (
                          <>
                            <p className="text-gray-400 line-through text-sm">
                              {(item.unitPrice * item.quantity).toLocaleString()}₫
                            </p>
                            <p className="font-semibold text-red-600">
                              {item.finalPrice.toLocaleString()}₫
                            </p>
                          </>
                        ) : (
                          <p className="font-semibold">
                            {(item.finalPrice || item.unitPrice * item.quantity).toLocaleString()}₫
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {store.promotion && (
                  <div className="mt-3 bg-yellow-50 border p-2 rounded text-sm text-yellow-700">
                    Khuyến mãi áp dụng: <b>{store.promotion.name}</b> –{" "}
                    {store.promotion.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tổng tiền + Nút mua */}
        {preOrder && preOrder.Store && (
          <div className="mt-8 border-t pt-4 flex justify-between items-center">
            <div className="text-lg font-semibold">
              Tổng tiền:{" "}
              <span className="text-red-500">
                {preOrder.finalTotal?.toLocaleString() || 0}₫
              </span>
            </div>
            <button
              onClick={() => onPayment()}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Mua hàng
            </button>
          </div>
        )}
      </div>

      {/* Modal thêm địa chỉ */}
      {formNewAddress}
    </>
  )}

export default Order