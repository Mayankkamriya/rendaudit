import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { 
  Car, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { Listing, AuditLog } from '../../types';

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
  const { user, loading } = useAuth();

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
      value: stats.totalListings,
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      name: 'Pending Review',
      value: stats.pendingListings,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Approved',
      value: stats.approvedListings,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Rejected',
      value: stats.rejectedListings,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your listings.</p>
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Listings */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Listings</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentListings.map((listing) => (
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
          </div>

          {/* Recent Audit Logs */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentAuditLogs.map((log) => (
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
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Fetch dashboard data
    const [statsRes, listingsRes, auditRes] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/listings?limit=1`),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/listings?limit=5`),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/audit-logs?limit=5`),
    ]);

    const statsData = await statsRes.json();
    const listingsData = await listingsRes.json();
    const auditData = await auditRes.json();

    const stats = {
      totalListings: statsData.data?.total || 0,
      pendingListings: 0,
      approvedListings: 0,
      rejectedListings: 0,
    };

    // Calculate status counts from listings data
    if (listingsData.data?.data) {
      listingsData.data.data.forEach((listing: Listing) => {
        switch (listing.status) {
          case 'pending':
            stats.pendingListings++;
            break;
          case 'approved':
            stats.approvedListings++;
            break;
          case 'rejected':
            stats.rejectedListings++;
            break;
        }
      });
    }

    return {
      props: {
        stats,
        recentListings: listingsData.data?.data || [],
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