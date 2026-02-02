import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './config/firebase';
import { 
  Users, 
  Car, 
  UserPlus,
  Shield,
  TrendingUp,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Map
} from 'lucide-react';
import LiveMap from './components/LiveMap';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'driver' | 'admin';
  status?: string;
  createdAt: any;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        role: 'user' as const,
        ...doc.data()
      } as User));
      setUsers(usersData);

      // Fetch drivers
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      const driversData = driversSnapshot.docs.map(doc => ({
        id: doc.id,
        role: 'driver' as const,
        ...doc.data()
      } as User));
      setDrivers(driversData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(driver => 
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200/50 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">
                    <span className="text-gray-900">Private</span>
                    <span className="text-red-500">Hire</span>
                  </h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Admin Panel</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-sm">
                <UserPlus size={16} />
                Add User
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Overview Section */}
        <div className="mb-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600 mt-0.5">Manage all users and drivers in the system</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Total Users */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-500" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-[10px] text-gray-500 mt-1">Registered customers</p>
            </div>

            {/* Total Drivers */}
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4 shadow-md text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Car className="text-white" size={20} />
                </div>
              </div>
              <p className="text-xs text-white/90 font-medium mb-1">Total Drivers</p>
              <p className="text-3xl font-bold mb-1">{drivers.length}</p>
              <p className="text-[10px] text-white/80">Licensed drivers</p>
            </div>

            {/* Total Accounts */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Shield className="text-purple-500" size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{users.length + drivers.length}</p>
              <p className="text-[10px] text-gray-500 mt-1">All system accounts</p>
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Map size={18} className="text-gray-700" />
            <h3 className="text-base font-bold text-gray-900">Live Fleet Map</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-[300px]">
              <LiveMap />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users & Drivers Tables */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Users ({filteredUsers.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="font-semibold text-sm text-gray-900">{user.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Mail size={14} className="text-gray-400" />
                          {user.email || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Phone size={14} className="text-gray-400" />
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-600 text-xs">
                        {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <Users size={40} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-medium text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* Drivers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Drivers ({filteredDrivers.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {driver.name?.charAt(0).toUpperCase() || 'D'}
                          </div>
                          <span className="font-semibold text-sm text-gray-900">{driver.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Mail size={14} className="text-gray-400" />
                          {driver.email || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <Phone size={14} className="text-gray-400" />
                          {driver.phone || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${
                          driver.status === 'online' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {driver.status || 'offline'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDrivers.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <Car size={40} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-medium text-gray-500">No drivers found</p>
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
