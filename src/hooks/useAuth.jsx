import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const authQuery = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await api.get("/users/me");
      return res.data.data.user;
    },
    retry: false,
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data.data.users;
    },
  });

  const signup = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/users/signup", data);
      return res.data;
    },
    onError: (err) => {
      console.error("Đăng ký thất bại:", err);
    },
  });

  const resendOtp = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/users/resend-otp", data);
      return res.data;
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/users/verify-otp", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["auth"]);
    },
  });

  const login = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/users/login", data);
      return res.data.data.user; // user chứa role
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries(["auth"]);
      console.log(user);
      if (user.role === "admin") {
        console.log("admin");
        navigate("/admin");
      } else if (user.role === "seller") {
        console.log("seller");
        navigate("/seller");
      } else {
        navigate("/"); // user bình thường
      }
    },
  });

  const updateMe = useMutation({
    mutationFn: async (data) => {
      const res = await api.patch("/users/me", data);
      return res.data.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth"], user);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const res = await api.post("/users/logout");
      return res.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth"], null);
    },
  });

  const confirmChangePassword = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/users/me/confirm-change-password", data);
      return res.data.valid;
    },
  });

  const changePassword = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/users/me/change-password", data);
      return res.data;
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const toggleUserActive = useMutation({
    mutationFn: async ({ isActive, userId }) => {
      const res = await api.patch(`/users/status`, { isActive, userId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
    onError: (err) => {
      console.error("Lỗi khi thay đổi trạng thái người dùng:", err);
    },
  });

  return {
    user: authQuery.data,
    isLoading: authQuery.isLoading,
    isError: authQuery.isError,

    users: usersQuery.data,
    isUsersLoading: usersQuery.isLoading,
    isUsersError: usersQuery.isError,

    login,
    signup,
    verifyOtp,
    resendOtp,
    updateMe,
    logout,
    confirmChangePassword,
    changePassword,

    toggleUserActive,
  };
}
