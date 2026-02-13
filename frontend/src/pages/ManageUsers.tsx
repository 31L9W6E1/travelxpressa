import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const ManageUsers = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/api/admin/users");
        setUsers(response.data.users || response.data.data?.users || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role });
      setUsers(users.map(user => user.id === userId ? { ...user, role } : user));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">{t('common.loading', 'Loading...')}</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">{t('manageUsers.title', 'Manage Users')}</h1>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">{t('manageUsers.name', 'Name')}</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">{t('manageUsers.email', 'Email')}</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">{t('manageUsers.role', 'Role')}</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">{t('manageUsers.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-b-0">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.role}</td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border border-input bg-background rounded-md px-2 py-1"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default ManageUsers;
