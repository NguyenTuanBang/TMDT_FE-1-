import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Chip,
  Pagination,
  Switch,
} from "@heroui/react";
import { EyeIcon, Trash2Icon } from "lucide-react";

const statusColorMap = {
  "Đang bán": "success",
  "Ngừng bán": "danger",
  "hết hàng": "warning",
};

export default function ProductTable({
  columns,
  data = [],
  onView,
  onToggleStatus,
}) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Dữ liệu được hiển thị theo trang
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [page, data]);

  // render từng cell
  const renderCell = useCallback(
    (product, columnKey, index) => {
      switch (columnKey) {
        case "stt":
          return (
            <span className="text-center">
              {(page - 1) * rowsPerPage + index + 1}
            </span>
          );

        case "code":
          return <span>{product._id}</span>;

        case "name":
          return (
            <div className="flex items-center gap-3">
              <img
                src={product.variants?.[0]?.image?.url || "/placeholder.png"}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">
                  {product.name}
                </span>
              </div>
            </div>
          );

        case "status":
          return (
            <div className="flex justify-center">
              <Chip
                size="sm"
                variant="flat"
                color={statusColorMap[product.status] || "default"}
                className="capitalize"
              >
                {product.status}
              </Chip>
            </div>
          );

        case "store":
          return (
            <span className="font-medium text-center">
              {product.store?.name || "—"}
            </span>
          );

        case "actions":
          return (
            <div className="flex justify-center items-center gap-3">
              {/* 👁️ Nút xem chi tiết */}
              <Tooltip content="Xem chi tiết">
                <span
                  className="text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => onView?.(product)}
                >
                  <EyeIcon size={20} />
                </span>
              </Tooltip>

              {/* 🔄 Switch đổi trạng thái */}
              <Tooltip
                content={
                  product.status === "Đang bán"
                    ? "Chuyển sang Ngừng bán"
                    : "Chuyển sang Đang bán"
                }
              >
                <Switch
                  size="sm"
                  color="success"
                  isSelected={product.status === "Đang bán"}
                  onChange={() => onToggleStatus?.(product)}
                  className={`rounded-full transition-all duration-300 ${
                    product.status === "Đang bán"
                      ? "" // bật thì giữ mặc định
                      : "border-2 border-gray-500 bg-gray-200 shadow-md hover:border-gray-600 hover:shadow-lg"
                  }`}
                  classNames={{
                    thumb:
                      product.status === "Đang bán"
                        ? "" // bật thì mặc định
                        : "bg-gray-400 shadow-inner border border-white", // tắt thì thumb rõ hơn
                  }}
                />
              </Tooltip>
            </div>
          );

        default:
          return null;
      }
    },
    [onView, onToggleStatus, page]
  );

  return (
    <div>
      <Table
        aria-label="Danh sách sản phẩm"
        bottomContentPlacement="outside"
        className="w-full"
        classNames={{
          wrapper:
            "bg-gradient-to-br from-green-100 via-green-50 to-green-200 rounded-2xl shadow-lg border-2 border-green-300 p-2",
          table: "table-fixed",
          th: "bg-green-600 text-white text-sm font-semibold uppercase tracking-wide py-3",
          tr: "hover:bg-amber-200 transition-colors duration-200",
          td: "text-gray-700 text-sm font-medium bg-white/80 backdrop-blur-sm py-2",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              className={`font-semibold ${
                ["stt", "status", "actions"].includes(column.uid)
                  ? "text-center"
                  : ""
              }`}
              style={{ width: column.width || "auto" }}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody items={paginatedData}>
          {(product) => {
            const index = paginatedData.indexOf(product);
            return (
              <TableRow key={product._id || index}>
                {(columnKey) => (
                  <TableCell
                    className={
                      ["stt", "status", "actions"].includes(columnKey)
                        ? "text-center"
                        : ""
                    }
                  >
                    {renderCell(product, columnKey, index)}
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      {/* Hiện phân trang */}
      {data.length && (
        <div className="flex justify-center mt-4">
          <Pagination
            color="success"
            variant="bordered"
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
