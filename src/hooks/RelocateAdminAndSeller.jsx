import React from 'react'
import useAuth from './useAuth'
import { Navigate } from 'react-router-dom';

const RelocateAdminAndSeller = ({children}) => {
  const {user}=useAuth()
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }else if(user?.role === "seller") {
    return <Navigate to="/seller" replace/>
  }

  return children;
}

export default RelocateAdminAndSeller