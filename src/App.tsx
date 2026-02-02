import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './config/firebase';
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation,
  ChevronRight
} from 'lucide-react';
import LiveMap from './components/LiveMap';

interface Stats {
  totalUsers: number;
  totalDrivers: number;
  activeTrips: number;
  totalRevenue: number;
  onlineDrivers: number;
  completedToday: number;
  pendingTrips: number;
}

interface Trip {
  id: string;
  customerName: string;
  driverName?: string;
  pickup: { name: string };
  destination: { name: string };
  status: string;
  fare: number;
  distance?: number;
  duration?: number;
  createdAt: any;
}

interface Driver {
  id: string;
  name: string;
  status: string;
  phone?: string;
  vehicle?: {
    model: string;
    plate: string;
  };
  totalTrips?: number;
  rating?: number;
}

function App() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDrivers: 0,
    activeTrips: 0,
    totalRevenue: 0,
    onlineDrivers: 0,
    completedToday: 0,
    pendingTrips: 0
  });
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to users count
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Listen to drivers
    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      const driversData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
      
      setDrivers(driversData);
      setStats(prev => ({ 
        ...prev, 
        totalDrivers: snapshot.size,
        onlineDrivers: driversData.filter(d => d.status === 'online').length
      }));
    });

    // Listen to active trips
    const activeTripsQuery = query(
      collection(db, 'trips'),
      where('status', 'in', ['pending', 'accepted', 'en-route-pickup', 'arrived', 'in-progress'])
    );
    const unsubActiveTrips = onSnapshot(activeTripsQuery, (snapshot) => {
      setStats(prev => ({ 
        ...prev, 
        activeTrips: snapshot.size,
        pendingTrips: snapshot.docs.filter(d => d.data().status === 'pending').length
      }));
    });

    // Listen to completed trips
    const completedTripsQuery = query(
      collection(db, 'trips'),
      where('status', '==', 'completed')
    );
    const unsubCompleted = onSnapshot(completedTripsQuery, (snapshot) => {
      const revenue = snapshot.docs.reduce((sum, doc) => sum + (doc.data().fare || 0), 0);
      
      // Count today's completed trips
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedToday = snapshot.docs.filter(doc => {
        const tripDate = doc.data().completedAt?.toDate();
        return tripDate && tripDate >= today;
      }).length;

      setStats(prev => ({ ...prev, totalRevenue: revenue, completedToday }));
    });

    // Listen to recent trips (last 20)
    const recentTripsQuery = query(
      collection(db, 'trips'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubRecentTrips = onSnapshot(recentTripsQuery, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
      'en-route-pickup': { label: 'En Route', className: 'bg-purple-100 text-purple-700 border-purple-200', icon: Navigation },
      arrived: { label: 'Arrived', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: MapPin },
      'in-progress': { label: 'In Progress', className: 'bg-green-100 text-green-700 border-green-200', icon: Activity },
      completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200/50 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Car size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="text-gray-900">Private</span>
                    <span className="text-red-500">Hire</span>
                  </h1>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Admin Panel</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">Admin Portal</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md relative">
                A
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Section */}
        <div className="mb-8">
          <div className="mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Overview</p>
            <h2 className="text-3xl font-bold text-gray-900">Hello, Admin</h2>
            <p className="text-gray-600 mt-1">Here's what's happening with your fleet today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Revenue */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-red-500" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Revenue</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">£{stats.totalRevenue.toFixed(0)}</p>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <TrendingUp size={16} />
                <span>+12% vs last week</span>
              </div>
            </div>

            {/* Active Rides */}
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Activity className="text-white" size={24} />
                </div>
                <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold">
                  {stats.pendingTrips} pending
                </span>
              </div>
              <p className="text-sm text-white/90 font-medium mb-1">Active Rides</p>
              <p className="text-5xl font-bold mb-2">{stats.activeTrips}</p>
              <div className="flex items-center gap-1 text-white/90 text-sm font-semibold">
                <Users size={16} />
                <span>{stats.onlineDrivers} drivers online</span>
              </div>
            </div>

            {/* New Bookings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <MapPin className="text-purple-500" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">New Bookings</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.completedToday}</p>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <TrendingUp size={16} />
                <span>+2% today</span>
              </div>
            </div>

            {/* Driver Rating */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-yellow-500" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Driver Rating</p>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-4xl font-bold text-gray-900">4.8</p>
                <p className="text-gray-400">/ 5.0</p>
              </div>
              <p className="text-xs text-gray-500">Based on {stats.totalDrivers * 60} reviews</p>
            </div>
          </div>
        </div>

        {/* Live Fleet Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Live Fleet Status</h3>
              <p className="text-sm text-gray-600 mt-1">Real-time tracking of drivers and trips</p>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
              View Full Map
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="h-[500px]">
              <LiveMap />
            </div>
          </div>
        </div>

        {/* Bottom Grid: Recent Activity & Online Drivers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {recentTrips.slice(0, 8).map((trip, index) => (
                <div key={trip.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      trip.status === 'completed' ? 'bg-green-100' : 
                      trip.status === 'pending' ? 'bg-blue-100' : 
                      'bg-purple-100'
                    }`}>
                      {trip.status === 'completed' ? (
                        <CheckCircle2 className="text-green-600" size={20} />
                      ) : trip.status === 'pending' ? (
                        <Navigation className="text-blue-600" size={20} />
                      ) : (
                        <Activity className="text-purple-600" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {trip.status === 'completed' ? `Ride #${trip.id.slice(0,4)} Completed` : 
                             trip.status === 'pending' ? `New Booking #${trip.id.slice(0,4)}` : 
                             `Ride #${trip.id.slice(0,4)} ${trip.status}`}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {trip.driverName ? `Driver: ${trip.driverName}` : `Customer: ${trip.customerName}`} • {formatTime(trip.createdAt)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-gray-900">£{trip.fare.toFixed(2)}</p>
                          {trip.status === 'completed' && (
                            <p className="text-xs text-gray-500">Card</p>
                          )}
                        </div>
                      </div>
                      {trip.status === 'pending' && (
                        <p className="text-xs text-gray-500 mt-1">Pickup: {trip.pickup.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Online Drivers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Active Fleet ({drivers.filter(d => d.status === 'online').length})</h3>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold border border-green-200">
                {stats.onlineDrivers} online
              </span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {drivers.filter(d => d.status === 'online').map((driver) => (
                <div key={driver.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{driver.name}</p>
                          <p className="text-sm text-gray-600">
                            {driver.vehicle?.model || 'No vehicle'} • {driver.vehicle?.color || 'Black'}
                          </p>
                          {driver.totalTrips && (
                            <div className="flex items-center gap-3 mt-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                <span className="text-yellow-500">★</span>
                                {driver.rating?.toFixed(1) || '5.0'}
                              </span>
                              <span className="text-xs text-gray-500">{driver.totalTrips} trips</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            ON TRIP
                          </span>
                          <p className="text-xs text-gray-500 mt-2">ID: #{driver.id.slice(0, 7)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {drivers.filter(d => d.status === 'online').length === 0 && (
                <div className="px-6 py-16 text-center">
                  <Car size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">No drivers online</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
