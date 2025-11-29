import React from "react";
import { Navigate, Route, Routes} from "react-router-dom";
import CreateOrder from "./pages/CreateOrder";
import "./index.css";
import Users from "./pages/User_list";
import { Dashboard } from "./pages/Dash/Dashboard";
import SupplierList from "./pages/Suppliers/supplierList";
import UserTasks from "./pages/Usertask";
import OrdersDashboard from "./pages/orders management/Ordersmanagement";
import InventoryLogs from "./pages/inventorymanagement/inventory_logs/index";
import ScheduleEditor from './pages/SchedulingComponents/ScheduleEditor'
import AppLayout from "./components/AppLayout"
import FileTracking from "./pages/FileTracking";

// lazy loaded components
const  DepartmentAssignment= React.lazy(()=>import("./pages/Department_assignment")) 
const InventoryManagement =React.lazy(()=>import("./pages/inventorymanagement/ParentComp")) ;
const SkipsManagement=React.lazy(()=>import("./pages/skips/parent"))
const Monitoring =React.lazy(()=>import("./pages/Monitoring"))
const  AssetsManagement=React.lazy(()=>import("./pages/AssetManagement/Assetmanagement"))
const ScheduleManager =React.lazy(()=>import("./pages/SchedulingComponents/ScheduleManager"))
const DraftSchedules =React.lazy(()=>import('./pages/SchedulingComponents/ScheduleManager/DraftSchedules')) ;
const ProtectedLayout=({isauthenticated,setisauthenticated})=>{
    return (
        
        <Routes>


            <Route path="admin" element={<AppLayout/>}>

                      <Route
                        path="usertasks"
                        element={
                            isauthenticated ? (
                                
                                
                                <UserTasks />
                                
                          ) : (
                            <Navigate to="/adminlogin" />
                          )
                        }
                      />
                      <Route
                        path="skipstracking"
                        element={
                          isauthenticated ? (
                              
                              <SkipsManagement />
                              
                          ) : (
                            <Navigate to="/adminlogin" />
                          )
                        }
                      />
                       <Route
                        path="inventorylogs"
                        element={
                          isauthenticated ? (
                         
                              <InventoryLogs />
                         
                            ) : (
                              <Navigate to="/adminlogin" />
                            )
                        }
                      />
                      <Route
                      path="filetracking"
                      element={
                        isauthenticated?(
                          <FileTracking/>
                        ):(
                          <Navigate to="/adminlogin" />
                        )
                      }
                      />
                      <Route
                        path="inventorymanagement"
                        element={
                          isauthenticated ? (
                            
                              <InventoryManagement />
                              
                            ) : (
                                <Navigate to="/adminlogin" />
                            )
                        }
                      />
                     
                    
                      <Route
                        path="schedules"
                        element={
                          isauthenticated ? (
                           
                              <DraftSchedules />
                            
                          ) : (
                            <Navigate to="/adminlogin" />
                          )
                        }
                      />
                      <Route
                        path="schedules/:id/edit"
                        element={
                          isauthenticated ? (
                           
                              <ScheduleEditor />
                            
                          ) : (
                            <Navigate to="/adminlogin" />
                          )
                        }
                      />
                      <Route
                        path="requestlist"
                        element={
                          isauthenticated ? (
                           
                              <OrdersDashboard setAuth={setisauthenticated}/>
                            
                          ) : (
                            <Navigate to="/adminlogin" />
                          )
                        }
                      />
                      <Route
                        path="supplierlist"
                        element={
                          isauthenticated ? (
                           
                              <SupplierList />
                            
                          ) : (
                            <Navigate to="/adminlogin" />
                          )
                        }
                      />
                      <Route
                        path="schedulemanager"
                        element={
                          isauthenticated ? (
                           
                              <ScheduleManager />
                            
                          ) : (
                            <Navigate to="/adminlogin" />
                          )
                        }
                      />
                      <Route
                        path="createorder"
                        element={
                          isauthenticated ? (
                              
                              <CreateOrder />
                              
                            ) : (
                            <Navigate to="/adminlogin" />
                        )
                    }
                        />
                      <Route
                        path="users"
                        element={
                            isauthenticated ? (
                                
                                <Users />
                            
                            ) : (
                            <Navigate to="/adminlogin" />
                          )
                        }
                        />
                     <Route
                        path="departmentassignment"
                        element={
                          isauthenticated ? (
                              
                              <DepartmentAssignment setAuth={setisauthenticated} />
                           
                          ) : (
                              <Navigate to="/adminlogin" />
                          )
                        }
                      />
                      <Route
                        path="assetsmanagement"
                        element={
                            isauthenticated ? (
                                
                                <AssetsManagement setAuth={setisauthenticated} />
                                
                            ) : (
                            <Navigate to="/adminlogin" />
                        )
                        }
                      />
                      <Route
                        path="monitoring"
                        element={
                          isauthenticated ? (
                              
                              <Monitoring />
                            
                            ) : (
                                <Navigate to="/adminlogin" />
                            )
                        }
                      />
                                            
                    
                      
                      <Route path="dashboard" element={isauthenticated ? <Dashboard />: <Navigate to="/adminlogin" />} />
                      <Route path="*" element={<Navigate to={isauthenticated ? "/dashboard" : "/adminlogin"} />} />
               
        
         </Route>
        
    </Routes>
        
    )

}

export default ProtectedLayout;
