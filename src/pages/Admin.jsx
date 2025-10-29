import { Outlet } from "react-router-dom";
import SideBarAdmin from "../components/SideBarAdmin";
import AdminNavbar from "../components/AdminNavbar";

function Admin() {
  return (
    <>
      <AdminNavbar />
      <div className="grid grid-cols-15 gap-4">
        <div className="col-span-3 p-4 rounded-lg">
          <SideBarAdmin />
        </div>
        <div className="col-span-12 rounded-lg">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Admin;
