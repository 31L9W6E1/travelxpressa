import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";
const ManageUsers = () => {
    const { isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/api/admin/users");
                setUsers(response.data.users || response.data.data?.users || []);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
            finally {
                setIsLoading(false);
            }
        };
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated]);
    const handleRoleChange = async (userId, role) => {
        try {
            await api.put(`/api/admin/users/${userId}/role`, { role });
            setUsers(users.map(user => user.id === userId ? { ...user, role } : user));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };
    if (isLoading) {
        return _jsx("div", { className: "p-8 text-center", children: "Loading..." });
    }
    if (error) {
        return _jsx("div", { className: "p-8 text-center text-red-500", children: error });
    }
    return (_jsxs("div", { className: "p-8", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Manage Users" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full bg-white", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "py-2 px-4 border-b", children: "Name" }), _jsx("th", { className: "py-2 px-4 border-b", children: "Email" }), _jsx("th", { className: "py-2 px-4 border-b", children: "Role" }), _jsx("th", { className: "py-2 px-4 border-b", children: "Actions" })] }) }), _jsx("tbody", { children: users.map((user) => (_jsxs("tr", { children: [_jsx("td", { className: "py-2 px-4 border-b", children: user.name }), _jsx("td", { className: "py-2 px-4 border-b", children: user.email }), _jsx("td", { className: "py-2 px-4 border-b", children: user.role }), _jsx("td", { className: "py-2 px-4 border-b", children: _jsxs("select", { value: user.role, onChange: (e) => handleRoleChange(user.id, e.target.value), className: "border border-gray-300 rounded-md p-1", children: [_jsx("option", { value: "USER", children: "USER" }), _jsx("option", { value: "ADMIN", children: "ADMIN" })] }) })] }, user.id))) })] }) })] }));
};
export default ManageUsers;
