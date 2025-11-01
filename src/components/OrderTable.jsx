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
} from "@heroui/react";
import { EyeIcon, Trash2Icon } from "lucide-react";

const statusColorMap = {
  Pending: "warning",
  Confirmed: "primary",
  Cancelled: "danger",
  Successful: "success"
};

export default function OrderTable({ columns, data = [], onView, onDelete }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // ✅ Lấy data theo trang
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [page, data]);

  // ✅ render cell
  const renderCell = useCallback(
    (order, columnKey, index) => {
      switch (columnKey) {
        case "stt":
          return <span>{(page - 1) * rowsPerPage + index + 1}</span>;

        case "code":
          return <span>{order._id}</span>;

        case "user":
          return (
            <span className="text-gray-600">{order.contact?.name || "-"}</span>
          );

        case "status":
          return (
            <div className="flex justify-center">
              <Chip
                size="sm"
                variant="flat"
                color={statusColorMap[order.status]}
                className="capitalize"
              >
                {order.status === "Pending"
                  ? "Đang xử lý"
                  : order.status === "Confirmed"
                  ? "Đang giao"
                  : order.status === "Successful"
                  ? "Hoàn thành"
                  : "Đã hủy"}
              </Chip>
            </div>
          );

        case "total":
          return (
            <span className="text-amber-700 font-medium text-center">
              {order.final_amount?.toLocaleString("vi-VN")} đ
            </span>
          );

        case "createdAt":
          return (
            <span className="text-center">
              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </span>
          );

        case "actions":
          return (
            <div className="flex justify-center gap-3">
              <Tooltip content="Xem chi tiết">
                <span
                  className="text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => onView?.(order)}
                >
                  <EyeIcon size={20} />
                </span>
              </Tooltip>             
            </div>
          );

        default:
          return null;
      }
    },
    [onView, onDelete, page]
  );

  return (
    <div>
      <Table
        aria-label="Danh sách đơn hàng"
        bottomContentPlacement="outside"
        className="w-full"
        classNames={{
          wrapper:
            "bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 rounded-2xl shadow-lg border-2 border-amber-300 p-2",
          table: "table-fixed",
          th: "bg-amber-600 text-white text-sm font-semibold uppercase tracking-wide py-3",
          tr: "hover:bg-amber-200 transition-colors duration-200",
          td: "text-gray-700 text-sm font-medium bg-white/80 backdrop-blur-sm py-4",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              className={`font-semibold ${
                ["stt", "status", "total", "createdAt", "actions"].includes(
                  column.uid
                )
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
          {(order) => {
            const index = paginatedData.indexOf(order);
            return (
              <TableRow key={order._id || index}>
                {(columnKey) => (
                  <TableCell
                    className={
                      [
                        "stt",
                        "status",
                        "total",
                        "createdAt",
                        "actions",
                      ].includes(columnKey)
                        ? "text-center"
                        : ""
                    }
                  >
                    {renderCell(order, columnKey, index)}
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      {/* ✅ Hiện phân trang */}
      {data.length > rowsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination
            showControls
            color="warning"
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
