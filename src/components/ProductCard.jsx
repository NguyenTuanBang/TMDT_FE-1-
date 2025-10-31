const ProductCard = ({ product }) => {
  const minPrice = Math.min(...product.variants.map((v) => v.price));

  const maxStars = 5;

  console.log(product);

  return (
    <div className="relative w-64 cursor-pointer overflow-hidden rounded-2xl border-3 border-gray-300  bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 text-blue-700 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl mb-8  ">
      <div className="absolute top-2 right-2 z-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-md">
        {product.producttags[0]?.tag.nameTag}
      </div>

      <div className="relative z-0 w-full h-48 flex items-center justify-center overflow-hidden rounded-t-2xl bg-gray-400">
        <img
          src={product.variants[0].image.url || "/ao.webp"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="relative z-0 p-3">
        <h3 className="text-md truncate font-semibold text-gray-800">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-5">
          <p className="text-lg font-bold text-blue-600">
            {minPrice.toLocaleString("vi-VN")}₫
          </p>
        </div>

        <div className="flex justify-between">
          <div className="mt-2 flex items-center gap-1 text-yellow-400">
            {Array.from({ length: maxStars }).map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                fill={i < Math.round(product.rating) ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.48 3.499a.562.562 0 011.04 0l2.107 5.076a.563.563 0 00.475.347l5.518.402a.562.562 0 01.316.98l-4.213 3.631a.563.563 0 00-.182.557l1.294 5.358a.562.562 0 01-.834.61l-4.723-2.885a.562.562 0 00-.586 0l-4.723 2.885a.562.562 0 01-.834-.61l1.294-5.358a.562.562 0 00-.182-.557L2.064 10.304a.562.562 0 01.316-.98l5.518-.402a.563.563 0 00.475-.347L10.48 3.5z"
                />
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-600">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>Đã bán: {product.tradedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
