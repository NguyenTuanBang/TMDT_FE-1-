import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

const fetchProducts = async () => {
  //   const params = new URLSearchParams();

  //   if (filters.search) params.append("search", filters.search);
  //   if (filters.status) params.append("status", filters.status);
  //   if (filters.page) params.append("page", filters.page);
  //   if (filters.limit) params.append("limit", filters.limit);

  const res = await api.get("/products");
  return res.data.data;
};

export default function useOrders(filters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(),
    keepPreviousData: true,
  });
}

const changeProductStatusApi = async ({ id, status }) => {
  const res = await api.patch("/products/change-product-status", {
    id,
    status,
  });
  return res.data.data; // trả về product mới
};

export function useChangeProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeProductStatusApi,
    onSuccess: () => {
      // Cập nhật cache react-query để table tự động refresh
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      console.error("Lỗi khi thay đổi trạng thái:", error);
    },
  });
}
