import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useState } from "react";

export default function RejectModal({ isOpen, onClose, onConfirm, storeName }) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return alert("Vui lòng nhập lý do từ chối!");
    onConfirm(reason);
    setReason("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      classNames={{ backdrop: "bg-black/70" }}
    >
      <ModalContent>
        <ModalHeader className="text-xl font-semibold text-red-600">
          Từ chối cửa hàng
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-700 mb-3">
            Bạn có chắc muốn <b>từ chối</b> cửa hàng{" "}
            <span className="text-blue-600">{storeName}</span>?
          </p>
          <Input
            label="Lý do từ chối"
            placeholder="Nhập lý do..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" color="default" onPress={onClose}>
            Hủy
          </Button>
          <Button color="danger" onPress={handleConfirm}>
            Xác nhận
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
