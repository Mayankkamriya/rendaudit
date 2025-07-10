import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {  
  ChevronLeft, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuditLog } from '../types';
import { format } from 'date-fns';

export default function AuditLogs() {
  const { user, token } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        action: actionFilter,
        adminId: adminFilter,
      });

      const response = await fetch(`/api/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data.data);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
      } else {
        toast.error('Failed to fetch audit logs');
      }
    } catch (error) {
      toast.error('Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAuditLogs();
    }
  }, [token, currentPage, actionFilter, adminFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return '✅';
      case 'reject':
        return '❌';
      case 'edit':
        return '✏️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'text-green-600 bg-green-100';
      case 'reject':
        return 'text-red-600 bg-red-100';
      case 'edit':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">Track all admin actions and changes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Actions</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="edit">Edit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin
              </label>
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Admins</option>
                <option value={user.id}>{user.name}</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setActionFilter('all');
                  setAdminFilter('all');
                  setCurrentPage(1);
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Activity Log ({total})
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <div key={log._id} className="px-6 py-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm">{getActionIcon(log.action)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {log.adminName}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-sm text-gray-500">
                          {log.listingTitle}
                        </span>
                      </div>
                      
                      {log.action === 'edit' && log.changes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Changes made:</p>
                          <ul className="mt-1 space-y-1">
                            {Object.entries(log.changes).map(([field, change]) => (
                              <li key={field} className="ml-4">
                                <span className="font-medium">{field}:</span> {change.from} → {change.to}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {log.action !== 'edit' && log.previousStatus && log.newStatus && (
                        <div className="mt-2 text-sm text-gray-600">
                          Status changed from <span className="font-medium">{log.previousStatus}</span> to{' '}
                          <span className="font-medium">{log.newStatus}</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary px-3 py-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary px-3 py-1 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 