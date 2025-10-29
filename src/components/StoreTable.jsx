import React, { useCallback, useMemo } from "react";
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
  User,
} from "@heroui/react";
import { EyeIcon, Trash2Icon } from "lucide-react";

const statusColorMap = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

export default function StoreTable({
  columns,
  data = [],
  pagination,
  page,
  onPageChange,
  onView,
  onDelete,
}) {
  const limit = pagination?.limit || 7;

  // client-side paginate nếu backend chưa chia
  const paginatedData = useMemo(() => {
    if (!pagination) {
      const start = (page - 1) * limit;
      return data.slice(start, start + limit);
    }
    return data;
  }, [data, page, pagination, limit]);

  const totalPages = pagination?.totalPages || Math.ceil(data.length / limit);

  const renderCell = useCallback(
    (store, columnKey, index) => {
      switch (columnKey) {
        case "stt":
          return <span>{(page - 1) * limit + index + 1}</span>;

        case "storename":
          return <span>{store.name}</span>;

        case "user":
          return (
            <User
              avatarProps={{ radius: "lg", src: store.user?.avatar }}
              description={store.user?.username}
              name={store.user?.email}
            />
          );

        case "status":
          return (
            <div className="flex justify-center">
              <Chip
                size="sm"
                variant="flat"
                color={statusColorMap[store.status] || "default"}
                className="capitalize"
              >
                {store.status === "approved"
                  ? "Đang hoạt động"
                  : store.status === "pending"
                  ? "Chờ duyệt"
                  : "Ngưng hoạt động"}
              </Chip>
            </div>
          );

        case "createdAt":
          return (
            <span className="text-center">
              {new Date(store.createdAt).toLocaleDateString("vi-VN")}
            </span>
          );

        case "actions":
          return (
            <div className="flex justify-center gap-3">
              <Tooltip content="Xem chi tiết">
                <span
                  className="text-blue-600 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => onView(store)}
                >
                  <EyeIcon size={20} />
                </span>
              </Tooltip>
              <Tooltip content="Xóa cửa hàng">
                <span
                  className="text-red-500 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => onDelete(store)}
                >
                  <Trash2Icon size={20} />
                </span>
              </Tooltip>
            </div>
          );

        default:
          return null;
      }
    },
    [onView, onDelete, page, limit]
  );

  return (
    <div>
      <Table
        aria-label="Danh sách cửa hàng"
        bottomContentPlacement="outside"
        className="w-full"
        classNames={{
          wrapper:
            "bg-gradient-to-br from-red-100 via-red-50 to-red-200 rounded-2xl shadow-lg border-2 border-red-300 p-2",
          table: "table-fixed",
          th: "bg-red-600 text-white text-sm font-semibold uppercase tracking-wide py-3",
          tr: "hover:bg-amber-200 transition-colors duration-200",
          td: "text-gray-700 text-sm font-medium bg-white/80 backdrop-blur-sm py-2",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              className={`font-semibold ${
                ["stt", "status", "createdAt", "actions"].includes(column.uid)
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
          {(store) => {
            const index = paginatedData.indexOf(store);
            return (
              <TableRow key={store._id || index}>
                {(columnKey) => (
                  <TableCell
                    className={
                      ["stt", "status", "createdAt", "actions"].includes(
                        columnKey
                      )
                        ? "text-center"
                        : ""
                    }
                  >
                    {renderCell(store, columnKey, index)}
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            showControls
            color="danger"
            variant="bordered"
            page={page}
            total={totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
