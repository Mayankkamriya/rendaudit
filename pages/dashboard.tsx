import { GetServerSideProps } from 'next';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { 
  Car, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Listing, AuditLog } from '../types';
import { useEffect, useState } from 'react';

interface DashboardProps {
  stats: {
    totalListings: number;
    pendingListings: number;
    approvedListings: number;
    rejectedListings: number;
  };
  recentListings: Listing[];
  recentAuditLogs: AuditLog[];
}

export default function Dashboard({ stats, recentListings, recentAuditLogs }: DashboardProps) {
  const { user, loading, token } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(stats);
  const [recentListingsData, setRecentListingsData] = useState(recentListings);
  const [recentAuditLogsData, setRecentAuditLogsData] = useState(recentAuditLogs);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state
  const [listingsPage, setListingsPage] = useState(1);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [listingsTotal, setListingsTotal] = useState(0);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);
  const itemsPerPage = 5;

  // Fetch real-time dashboard data
  const fetchDashboardData = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      // Get all listings for accurate stats
      const allListingsRes = await fetch('/api/listings?limit=1000&status=all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const allListingsData = await allListingsRes.json();
      const allListings = allListingsData.data?.data || [];

      // Get recent listings with pagination
      const recentListingsRes = await fetch(`/api/listings?limit=${itemsPerPage}&page=${listingsPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const recentListingsData = await recentListingsRes.json();

      // Get recent audit logs with pagination
      const auditLogsRes = await fetch(`/api/audit-logs?limit=${itemsPerPage}&page=${auditLogsPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const auditLogsData = await auditLogsRes.json();

      // Calculate real statistics
      const realStats = {
        totalListings: allListings.length,
        pendingListings: allListings.filter((listing: Listing) => listing.status === 'pending').length,
        approvedListings: allListings.filter((listing: Listing) => listing.status === 'approved').length,
        rejectedListings: allListings.filter((listing: Listing) => listing.status === 'rejected').length,
      };

      setDashboardStats(realStats);
      setRecentListingsData(recentListingsData.data?.data || []);
      setRecentAuditLogsData(auditLogsData.data?.data || []);
      setListingsTotal(recentListingsData.data?.total || 0);
      setAuditLogsTotal(auditLogsData.data?.total || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, listingsPage, auditLogsPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const statCards = [
    {
      name: 'Total Listings',
      value: dashboardStats.totalListings,
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      name: 'Pending Review',
      value: dashboardStats.pendingListings,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
        name: 'Approved',
        value: dashboardStats.approvedListings,
        icon: CheckCircle,
        color: 'bg-green-500',
    },
    {
      name: 'Rejected',
      value: dashboardStats.rejectedListings,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your listings.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats.totalListings > 0 
                    ? Math.round((dashboardStats.approvedListings / dashboardStats.totalListings) * 100)
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardStats.pendingListings}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                <p className="text-2xl font-bold text-blue-600">
                  {recentAuditLogsData.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Listings */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Listings</h3>
                <span className="text-sm text-gray-500">
                  {listingsTotal} total listings
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentListingsData.map((listing) => (
                <div key={listing._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {listing.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {listing.carModel} • {listing.carYear}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`status-badge status-${listing.status}`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Listings Pagination */}
            {listingsTotal > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((listingsPage - 1) * itemsPerPage) + 1} to {Math.min(listingsPage * itemsPerPage, listingsTotal)} of {listingsTotal}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setListingsPage(Math.max(1, listingsPage - 1))}
                      disabled={listingsPage === 1}
                      className="btn-secondary px-3 py-1 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setListingsPage(Math.min(Math.ceil(listingsTotal / itemsPerPage), listingsPage + 1))}
                      disabled={listingsPage >= Math.ceil(listingsTotal / itemsPerPage)}
                      className="btn-secondary px-3 py-1 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Audit Logs */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <span className="text-sm text-gray-500">
                  {auditLogsTotal} total logs
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentAuditLogsData.map((log) => (
                <div key={log._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {log.adminName} {log.action}ed
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {log.listingTitle}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Audit Logs Pagination */}
            {auditLogsTotal > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((auditLogsPage - 1) * itemsPerPage) + 1} to {Math.min(auditLogsPage * itemsPerPage, auditLogsTotal)} of {auditLogsTotal}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAuditLogsPage(Math.max(1, auditLogsPage - 1))}
                      disabled={auditLogsPage === 1}
                      className="btn-secondary px-3 py-1 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setAuditLogsPage(Math.min(Math.ceil(auditLogsTotal / itemsPerPage), auditLogsPage + 1))}
                      disabled={auditLogsPage >= Math.ceil(auditLogsTotal / itemsPerPage)}
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
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Fetch dashboard data with proper authentication
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Get all listings to calculate accurate stats
    const allListingsRes = await fetch(`${baseUrl}/api/listings?limit=1000&status=all`);
    const allListingsData = await allListingsRes.json();
    
    // Get recent listings for display
    const recentListingsRes = await fetch(`${baseUrl}/api/listings?limit=5`);
    const recentListingsData = await recentListingsRes.json();
    
    // Get recent audit logs
    const auditRes = await fetch(`${baseUrl}/api/audit-logs?limit=5`);
    const auditData = await auditRes.json();

    // Calculate accurate statistics
    const allListings = allListingsData.data?.data || [];
    const stats = {
      totalListings: allListings.length,
      pendingListings: allListings.filter((listing: Listing) => listing.status === 'pending').length,
      approvedListings: allListings.filter((listing: Listing) => listing.status === 'approved').length,
      rejectedListings: allListings.filter((listing: Listing) => listing.status === 'rejected').length,
    };

    return {
      props: {
        stats,
        recentListings: recentListingsData.data?.data || [],
        recentAuditLogs: auditData.data?.data || [],
      },
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      props: {
        stats: { totalListings: 0, pendingListings: 0, approvedListings: 0, rejectedListings: 0 },
        recentListings: [],
        recentAuditLogs: [],
      },
    };
  }
}; 