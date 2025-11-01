import CustomModal from "./Modal.jsx";
import CustomSelect from "./CustomSelect.jsx";
import { useDisclosure, Button, Input } from "@heroui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import axios from "axios";
import useAddress from "../hooks/useAdress.jsx";
import useToast from "../hooks/useToast.jsx";
import AdressCardList from "../components/AddressCardList.jsx";
import api from "../utils/api.jsx";

function Address() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const { addAddress } = useAddress();
  const toast = useToast();

  const [coordinates, setCoordinates] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // Mở modal và tải danh sách tỉnh
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

  // Validation
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

  // Khi đóng modal → reset toàn bộ
  const handleClose = (resetForm) => {
    resetForm();
    setCoordinates(null);
    onOpenChange(false);
  };

  // Submit chính (Formik)
  const handleSubmit = async (values, { resetForm }) => {
    const province = provinces.find((p) => p.value == values.province)?.name;
    const district = districts.find((d) => d.value == values.district)?.name;
    const ward = wards.find((w) => w.value == values.ward)?.name;
    // const fullAddress = `${values.detail}, ${ward}, ${district}, ${province}`;
    const parts = [
      values.detail?.trim(),                 // ví dụ: "337/2ThạchLam"
      ward,             // "Phường Phú Thạnh"
      district,         // "Quận Tân Phú"
      province,         // "Thành phố Hồ Chí Minh"
      'Việt Nam',
    ].filter(Boolean);
    const fullAddress = parts.join(', ');

    // Nếu chưa có tọa độ => xác nhận địa chỉ
    if (!coordinates) {
      try {
        setLoadingGeo(true);
        const res = await api.get(`/geocode?address=${encodeURIComponent(fullAddress)}`);
        console.log("📍 Full address gửi lên:", fullAddress);
    console.log("📦 Dữ liệu trả về từ API:", res.data);
        setCoordinates(res.data);
        toast.success("Thành công", "Đã tìm thấy tọa độ! Xác nhận lần nữa để lưu.");
      } catch (err) {
        toast.error("Lỗi", "Không tìm thấy tọa độ");
        console.error(err);
      } finally {
        setLoadingGeo(false);
      }
      return; // Dừng lại, chưa gửi BE
    }

    // Nếu đã có tọa độ => gửi về backend
    console.log("Gửi địa chỉ:", coordinates.lat, coordinates.lng);
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
        toast.success("Thành công", "Bạn đã thêm một địa chỉ mới");
      },
      onError: (err) => {
        console.error(err);
      },
    });
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-lg shadow flex justify-between mb-10 p-4">
        <div>
          <h2 className="text-2xl font-semibold text-blue-600">
            Địa Chỉ Của Tôi
          </h2>
          <p>Cập nhật địa chỉ để nhận hàng</p>
        </div>
        <Button color="primary" onPress={handleOpen}>
          + Thêm địa chỉ mới
        </Button>
      </div>

      <AdressCardList />

      {/* Formik */}
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
        {({ handleSubmit, resetForm, values, setFieldValue }) => (
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
                {/* Khi người dùng thay đổi input => reset tọa độ */}
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

                {/* Bản đồ hiển thị ngay dưới form */}
                {coordinates && (
                  <div className="mt-6 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">
                      Vị trí của bạn
                    </h3>
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
    </>
  );
}

export default Address;
