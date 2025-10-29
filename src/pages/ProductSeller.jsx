import FormCreateProduct from "../components/FormCreateProduct";
import useAuth from "../hooks/useAuth";
import useProduct from "../hooks/useProduct";
import useStores from "../hooks/useStore";
import ProductList from "../pages/ProductList";

function ProductSeller() {
  const { data: products } = useProduct();
  const { user } = useAuth();
  const { data: stores } = useStores();

  if (!stores || !user || !products) return;

  const store = stores.find((store) => store.user._id === user._id);
  const product = products.filter((product) => product.store_id === store._id);

  return (
    <>
      <ProductList storeProduct={product} />
    </>
  );
}

export default ProductSeller;
