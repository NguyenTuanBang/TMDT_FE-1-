// 404Page.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="grid  place-items-center bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 px-6 py-24 sm:py-32 lg:px-8 font-sans text-center">
      <div className="max-w-xl">
        {/* Mã lỗi */}
        <p className="text-9xl font-extrabold text-blue-400 animate-pulse drop-shadow-lg">
          404
        </p>

        {/* Tiêu đề phụ */}
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Trang bạn tìm kiếm không tồn tại
        </h1>

        {/* Nút điều hướng */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/"
            className="relative inline-block px-8 py-3 text-white font-semibold rounded-md overflow-hidden shadow-lg bg-blue-600 hover:bg-blue-500 transition duration-300"
          >
            <span className="relative z-10">Quay về trang chủ</span>
            <span className="absolute inset-0 bg-blue-400 opacity-0 hover:opacity-20 transition duration-300"></span>
          </Link>
        </div>

        {/* Hình minh họa */}
        <div className="mt-12 relative flex justify-center">
          <div className="absolute w-56 h-56 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="404 illustration"
            className="relative z-10 mx-auto w-52 sm:w-52 opacity-90 drop-shadow-lg"
          />
        </div>
      </div>
    </main>
  );
}
