import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

const fetchStores = async () => {
  const res = await api.get("/stores");
  return res.data?.data || [];
};

export default function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    retry: 1,
  });
}
