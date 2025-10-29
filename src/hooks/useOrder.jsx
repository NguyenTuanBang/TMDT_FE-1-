import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

const fetchOrders = async () => {
  //   const params = new URLSearchParams();

  //   if (filters.search) params.append("search", filters.search);
  //   if (filters.status) params.append("status", filters.status);
  //   if (filters.page) params.append("page", filters.page);
  //   if (filters.limit) params.append("limit", filters.limit);

  const res = await api.get("/orders");
  return res.data.data;
};

export default function useOrders(filters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrders(),
    keepPreviousData: true,
  });
}

const fetchOrderById = async (userId) => {
  const res = await api.get(`/orders/${userId}`);
  return res.data.data; // giả sử backend trả về { data: {...} }
};

export function useOrderById(userId) {
  return useQuery({
    queryKey: ["order", userId],
    queryFn: () => fetchOrderById(userId),
    enabled: !!userId,
  });
}
