/* eslint-disable react-hooks/exhaustive-deps */
import * as Sentry from '@sentry/react';
import UserDetails from "../UserDetails"
import React, { useState } from 'react';
import { useUser } from "../../components/usercontext";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { fetch_RBAC_DASH, fetch_RBAC } from '../../services/rbac_service';
import UserDetailsSkeleton from '../../skeletons/UserDetails_skeleton';
import { motion } from 'framer-motion';
import { isProd } from '../../components/env';


export const Dashboard = ({ setLayoutLoading }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [request, setRequest] = useState();
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);
    const [completedOrders, setcompletedOrders] = useState([]);
    const [DepartmentalAccess, setDepartmentalAccess] = useState([]);
    const [GeneralAccess, setGeneralAccess] = useState([]);
    const [adminRoles, setAdminRoles] = useState([]);
    const [protectedUsers, setProtectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof setLayoutLoading === "function") {
            setLayoutLoading(isLoading);
        }
    }, [isLoading, setLayoutLoading]);

    useEffect(() => {
        return () => {
            if (typeof setLayoutLoading === "function") {
                setLayoutLoading(false);
            }
        };
    }, [setLayoutLoading]);

    useEffect(() => {
        const fetchorder = async (rbacData = {}) => {
            if (!user || !user.email) return;

            try {
                let response;
                const { GENERAL_ACCESS = [], DEPARTMENTAL_ACCESS = [] } = rbacData;
                if (GENERAL_ACCESS.includes(user?.role)) {
                    const API_URL = `${process.env.REACT_APP_API_URL}/api`;
                    const userReq = await axios.get(`${API_URL}/orders/monthlyrequests`, { withCredentials: true });
                    response = userReq.data.data;
                } else if (DEPARTMENTAL_ACCESS.includes(user?.role)) {
                    if (!user?.Department) return;
                    const API_URL = `${process.env.REACT_APP_API_URL}/api`;
                    const userReq = await axios.get(`${API_URL}/orders/monthlyrequests`, {
                        params: { Department: user.Department },
                        withCredentials: true,
                    });
                    response = userReq.data.data;
                } else {
                    const API_URL = `${process.env.REACT_APP_API_URL}/api`;
                    const userReq = await axios.get(`${API_URL}/orders/StaffRequests`, {
                        params: { userId: user.userId },
                    });
                    response = userReq.data.data;
                }

                if (Array.isArray(response)) {
                    setRequest(response);
                    setApprovedOrders(response.filter((o) => o.status === 'Approved'));
                    setPendingOrders(response.filter((o) => o.status === 'Pending'));
                    setRejectedOrders(response.filter((o) => o.status === 'Rejected'));
                    setcompletedOrders(response.filter((o) => o.status === 'Completed'));
                } else {
                    if (isProd) Sentry.captureMessage('invalid format');
                }
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    navigate('/adminlogin');
                } else {
                    if (isProd) Sentry.captureException(error);
                }
            }
        };

        const init = async () => {
            try {
                setIsLoading(true);
                const [dashRbac, generalRbac] = await Promise.all([fetch_RBAC_DASH(), fetch_RBAC()]);

                if (dashRbac) {
                    const { GENERAL_ACCESS = [], DEPARTMENTAL_ACCESS = [] } = dashRbac.data.data;
                    setDepartmentalAccess(DEPARTMENTAL_ACCESS);
                    setGeneralAccess(GENERAL_ACCESS);
                    await fetchorder(dashRbac.data.data);
                }

                if (generalRbac) {
                    setAdminRoles(generalRbac.data.data.ADMIN_ROLES_GENERAL || []);
                    setProtectedUsers(generalRbac.data.data.PROTECTED_USERS || []);
                }
            } catch (error) {
                if (isProd) Sentry.captureException(error);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [user]);

    const request_length = (req) => Array.isArray(req) ? req.length : 0;
    const request_amount = request_length(request);

    return (
        <>
            {isLoading ? (
                <UserDetailsSkeleton />
            ) : (
                user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="min-h-screen bg-gray-300 mt-16"
                    >
                        <h1 className="text-3xl font-bold text-gray-800">Welcome {user?.name.split(" ").slice(-1)[0]}</h1>
                        <p className="text-gray-600 mt-2 mb-4">Manage your Requests efficiently.</p>
                        <UserDetails
                            user={user}
                            rejectedOrders={rejectedOrders}
                            request_amount={request_amount}
                            approvedOrders={approvedOrders}
                            pendingOrders={pendingOrders}
                            completedOrders={completedOrders}
                            DepartmentalAcess={DepartmentalAccess}
                            GeneralAccess={GeneralAccess}
                            adminRoles={adminRoles}
                            protectedUsers={protectedUsers}
                        />
                    </motion.div>
                )
            )}
        </>
    );
};
