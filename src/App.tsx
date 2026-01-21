import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from './config/firebase';
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  Activity,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalDrivers: number;
  activeTrips: number;
  totalRevenue: number;
  onlineDrivers: number;
}

interface Trip {
  id: string;
  customerName: string;
  driverName?: string;
  pickup: { name: string };
  destination: { name: string };
  status: string;
  fare: number;
  createdAt: any;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDrivers: 0,
    activeTrips: 0,
    totalRevenue: 0,
    onlineDrivers: 0
  });
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to stats
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      setStats(prev => ({ 
        ...prev, 
        totalDrivers: snapshot.size,
        onlineDrivers: snapshot.docs.filter(d => d.data().status === 'online').length
      }));
    });

    const activeTripsQuery = query(
      collection(db, 'trips'),
      where('status', 'in', ['pending', 'accepted', 'en-route-pickup', 'arrived', 'in-progress'])
    );
    const unsubActiveTrips = onSnapshot(activeTripsQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeTrips: snapshot.size }));
    });

    const completedTripsQuery = query(
      collection(db, 'trips'),
      where('status', '==', 'completed')
    );
    const unsubCompleted = onSnapshot(completedTripsQuery, (snapshot) => {
      const revenue = snapshot.docs.reduce((sum, doc) => sum + (doc.data().fare || 0), 0);
      setStats(prev => ({ ...prev, totalRevenue: revenue }));
    });

    // Listen to recent trips
    const recentTripsQuery = query(
      collection(db, 'trips'),
      orderBy('createdAt', 'desc')
    );
    const unsubRecentTrips = onSnapshot(recentTripsQuery, (snapshot) => {
      const trips = snapshot.docs.slice(0, 10).map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Trip));
      setRecentTrips(trips);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubDrivers();
      unsubActiveTrips();
      unsubCompleted();
      unsubRecentTrips();
    };
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-primary to-primary-dark text-white shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-1">PrivateHire</h1>
          <p className="text-sm text-blue-200">Admin Dashboard</p>
        </div>
        
        <nav className="mt-6">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'drivers', icon: Car, label: 'Drivers' },
            { id: 'trips', icon: MapPin, label: 'Trips' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
                activeTab === item.id 
                  ? 'bg-white/20 border-l-4 border-gold' 
                  : 'hover:bg-white/10'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'users' && 'Users Management'}
            {activeTab === 'drivers' && 'Drivers Management'}
            {activeTab === 'trips' && 'Trips Management'}
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Car className="text-purple-600" size={24} />
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  {stats.onlineDrivers} online
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Drivers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDrivers}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-orange-600" size={24} />
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                  Active
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Active Trips</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeTrips}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">£{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Recent Trips Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Recent Trips</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTrips.map(trip => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{trip.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-600">{trip.driverName || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{trip.pickup.name}</div>
                        <div className="text-xs text-gray-500">→ {trip.destination.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">£{trip.fare.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
