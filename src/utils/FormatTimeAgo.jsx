export function formatTimeAgo(date) {
  if (!date) return "-";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past; // difference in milliseconds
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Đang hoạt động"; // dưới 1 phút
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
}
