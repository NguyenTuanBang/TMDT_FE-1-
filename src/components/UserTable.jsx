import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  Pagination,
  Switch,
} from "@heroui/react";
import { EyeIcon, EditIcon, DeleteIcon, LockIcon } from "../icons/icons";
import { formatTimeAgo } from "../utils/FormatTimeAgo";

const statusColorMap = {
  active: "success",
  inactive: "danger",
};

export default function UserTable({ data = [], onView, onEdit, onDelete }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;

  const pages = Math.ceil(data.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [page, data]);

  const renderCell = React.useCallback(
    (user, columnKey, index) => {
      const cellValue = user[columnKey];
      switch (columnKey) {
        case "stt":
          return <span>{(page - 1) * rowsPerPage + index + 1}</span>;

        case "name":
          return (
            <User
              avatarProps={{ radius: "lg", src: user.avatar }}
              description={user.email}
              name={user.username}
            />
          );

        case "role":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize text-default-500">
                {user.role === "user"
                  ? "Người dùng"
                  : user.role === "seller"
                  ? "Người bán hàng"
                  : "Quản lí"}
              </p>
            </div>
          );

        case "status": {
          const status = user.isActive ? "active" : "inactive";
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[status]}
              size="sm"
              variant="flat"
            >
              {status === "active" ? "Xác thực" : "Bị khóa"}
            </Chip>
          );
        }

        case "lastActivity":
          return (
            <span className="italic text-gray-500">
              {formatTimeAgo(user.lastActivity)}
            </span>
          );

        case "actions":
          return (
            <div className="relative flex items-center justify-center gap-2">
              <Tooltip content="Details">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => onView?.(user)}
                >
                  <EyeIcon />
                </span>
              </Tooltip>
              <Tooltip content="Edit user">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => onEdit?.(user)}
                >
                  <EditIcon />
                </span>
              </Tooltip>

              <Tooltip
                content={
                  user.isActive ? "Chuyển sang bị khóa" : "Mở khóa người dùng"
                }
              >
                <Switch
                  size="sm"
                  color="primary"
                  isSelected={user.isActive}
                  onChange={() => onDelete?.(user)} // tái sử dụng hàm xóa để hiện modal xác nhận
                  className={`rounded-full transition-all duration-300 ${
                    user.isActive
                      ? "" // giữ mặc định khi đang hoạt động
                      : "border-2 border-gray-500 bg-gray-200 shadow-md hover:border-gray-600 hover:shadow-lg"
                  }`}
                  classNames={{
                    thumb: user.isActive
                      ? ""
                      : "bg-gray-400 shadow-inner border border-white",
                  }}
                />
              </Tooltip>
            </div>
          );

        default:
          return cellValue;
      }
    },
    [onView, onEdit, onDelete, page]
  );

  return (
    <div>
      <Table
        aria-label="User Table"
        bottomContentPlacement="outside"
        className="w-full"
        classNames={{
          wrapper:
            "bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 rounded-2xl shadow-lg border-2 border-blue-300 p-2",
          table: "table-fixed",
          th: "bg-blue-600 text-white text-sm font-semibold uppercase tracking-wide py-3",
          tr: "hover:bg-blue-100 transition-colors duration-200 ",
          td: "text-gray-900 text-sm font-medium bg-white/80 backdrop-blur-sm",
        }}
      >
        <TableHeader>
          <TableColumn
            key="stt"
            style={{ width: "4%" }}
            className="text-center"
          >
            STT
          </TableColumn>
          <TableColumn key="name" style={{ width: "15%" }}>
            Tên
          </TableColumn>
          <TableColumn
            key="role"
            style={{ width: "10%" }}
            className="text-center"
          >
            Vai trò
          </TableColumn>
          <TableColumn
            key="status"
            style={{ width: "10%" }}
            className="text-center"
          >
            Trạng thái
          </TableColumn>
          <TableColumn
            key="lastActivity"
            style={{ width: "10%" }}
            className="text-center"
          >
            Lần cuối hoạt động
          </TableColumn>
          <TableColumn
            key="actions"
            style={{ width: "10%" }}
            className="text-center"
          >
            Hành động
          </TableColumn>
        </TableHeader>

        <TableBody items={paginatedData}>
          {(item) => {
            const index = paginatedData.indexOf(item);
            return (
              <TableRow key={item._id}>
                {(columnKey) => (
                  <TableCell
                    className={
                      [
                        "stt",
                        "role",
                        "status",
                        "lastActivity",
                        "actions",
                      ].includes(columnKey)
                        ? "text-center"
                        : ""
                    }
                  >
                    {renderCell(item, columnKey, index)}
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      {data.length > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination
            showControls
            color="primary"
            variant="bordered"
            page={page}
            total={pages}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
