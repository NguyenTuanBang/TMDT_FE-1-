import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

export default function useUsers(filters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (filters.search) query.append("search", filters.search);
      if (filters.role) query.append("role", filters.role);
      if (filters.isActive !== "") query.append("isActive", filters.isActive);
      query.append("page", filters.page);
      query.append("limit", filters.limit);

      const res = await api.get(`/users?${query.toString()}`);
      return res.data;
    },
    keepPreviousData: true,
  });
}
