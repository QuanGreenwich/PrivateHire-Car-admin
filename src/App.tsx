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
  Phone
} from 'lucide-react';

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
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield size={24} className="text-white" />
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
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-sm">
                <UserPlus size={18} />
                Add User
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600 mt-1">Manage all users and drivers in the system</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Users */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-500" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Users</p>
              <p className="text-4xl font-bold text-gray-900">{users.length}</p>
              <p className="text-xs text-gray-500 mt-2">Registered customers</p>
            </div>

            {/* Total Drivers */}
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Car className="text-white" size={24} />
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium mb-1">Total Drivers</p>
              <p className="text-5xl font-bold mb-2">{drivers.length}</p>
              <p className="text-xs text-white/80">Licensed drivers</p>
            </div>

            {/* Total Accounts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Shield className="text-purple-500" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Accounts</p>
              <p className="text-4xl font-bold text-gray-900">{users.length + drivers.length}</p>
              <p className="text-xs text-gray-500 mt-2">All system accounts</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users & Drivers Tables */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Users ({filteredUsers.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="font-semibold text-gray-900">{user.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} className="text-gray-400" />
                          {user.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} className="text-gray-400" />
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={18} className="text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <Users size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* Drivers Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Drivers ({filteredDrivers.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                            {driver.name?.charAt(0).toUpperCase() || 'D'}
                          </div>
                          <span className="font-semibold text-gray-900">{driver.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} className="text-gray-400" />
                          {driver.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} className="text-gray-400" />
                          {driver.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          driver.status === 'online' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {driver.status || 'offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={18} className="text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDrivers.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <Car size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">No drivers found</p>
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
