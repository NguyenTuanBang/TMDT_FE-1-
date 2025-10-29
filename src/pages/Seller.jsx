import { Outlet } from "react-router-dom";
import SideBarSeller from "../components/SideBarSeller";
import SellerNavbar from "../components/SellerNavbar";

function Seller() {
  return (
    <>
      <SellerNavbar />
      <div className="grid grid-cols-15 gap-4 p-4">
        <div className="col-span-3 p-4 rounded-lg">
          <SideBarSeller />
        </div>
        <div className="col-span-12  rounded-lg">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Seller;
