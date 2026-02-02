import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls, MapRoute } from './ui/map';
import { Car, User, Navigation, MapPin, Clock, X } from 'lucide-react';
import { calculateRoute } from '../utils/routing';

interface Driver {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: string;
  vehicle?: {
    type: string;
    plate: string;
    model: string;
    color: string;
  };
  phone?: string;
}

interface Trip {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  pickup: {
    name: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    name: string;
    latitude: number;
    longitude: number;
  };
  status: string;
  fare: number;
  distance?: number;
  duration?: number;
  paymentMethod?: string;
  vehicleType?: string;
  createdAt?: Date | { seconds: number; nanoseconds: number };
  acceptedAt?: Date | { seconds: number; nanoseconds: number };
  startedAt?: Date | { seconds: number; nanoseconds: number };
}

export default function LiveMap() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [tripRoutes, setTripRoutes] = useState<Record<string, [number, number][]>>({});
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.1278, 51.5074]);
  const [mapZoom, setMapZoom] = useState(12);

  // Listen to online drivers
  useEffect(() => {
    const driversQuery = query(
      collection(db, 'drivers'),
      where('status', '==', 'online')
    );
    const unsubDrivers = onSnapshot(driversQuery, (snapshot) => {
      const driverData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Driver))
        .filter(d => d.location?.latitude && d.location?.longitude);
      console.log('🚗 Online drivers:', driverData.length);
      setDrivers(driverData);
    });

    return () => unsubDrivers();
  }, []);

  // Listen to active trips
  useEffect(() => {
    const tripsQuery = query(
      collection(db, 'trips'),
      where('status', 'in', ['pending', 'accepted', 'en-route-pickup', 'arrived', 'in-progress'])
    );
    const unsubTrips = onSnapshot(tripsQuery, (snapshot) => {
      const tripData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Trip))
        .filter(t => 
          t.pickup?.latitude && 
          t.pickup?.longitude && 
          t.destination?.latitude && 
          t.destination?.longitude
        );
      console.log('🚗 Active trips loaded:', tripData.length, tripData);
      setActiveTrips(tripData);
    });

    return () => unsubTrips();
  }, []);

  // Fetch real routes for all active trips
  useEffect(() => {
    const fetchRoutes = async () => {
      const routes: Record<string, [number, number][]> = {};
      
      for (const trip of activeTrips) {
        try {
          const routeData = await calculateRoute(
            {
              longitude: trip.pickup.longitude,
              latitude: trip.pickup.latitude,
              name: trip.pickup.name
            },
            {
              longitude: trip.destination.longitude,
              latitude: trip.destination.latitude,
              name: trip.destination.name
            },
            (trip.vehicleType || 'standard') as 'standard' | 'executive' | 'luxury'
          );
          routes[trip.id] = routeData.coordinates;
        } catch (error) {
          console.error(`Failed to fetch route for trip ${trip.id}:`, error);
          // Fallback to straight line
          routes[trip.id] = [
            [trip.pickup.longitude, trip.pickup.latitude],
            [trip.destination.longitude, trip.destination.latitude]
          ];
        }
      }
      
      setTripRoutes(routes);
    };

    if (activeTrips.length > 0) {
      fetchRoutes();
    }
  }, [activeTrips]);

  // Filter trips based on status
  const filteredTrips = useMemo(() => {
    if (filterStatus === 'all') return activeTrips;
    return activeTrips.filter(t => t.status === filterStatus);
  }, [activeTrips, filterStatus]);

  // Focus on selected trip
  const focusOnTrip = useCallback((trip: Trip) => {
    setSelectedTrip(trip);
    const centerLng = (trip.pickup.longitude + trip.destination.longitude) / 2;
    const centerLat = (trip.pickup.latitude + trip.destination.latitude) / 2;
    setMapCenter([centerLng, centerLat]);
    setMapZoom(13);
  }, []);

  // Get status color and label
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; bg: string; label: string }> = {
      pending: { color: '#eab308', bg: 'bg-yellow-500', label: 'Pending' },
      accepted: { color: '#3b82f6', bg: 'bg-blue-500', label: 'Accepted' },
      'en-route-pickup': { color: '#8b5cf6', bg: 'bg-purple-500', label: 'En Route' },
      arrived: { color: '#f97316', bg: 'bg-orange-500', label: 'Arrived' },
      'in-progress': { color: '#10b981', bg: 'bg-green-500', label: 'In Progress' },
    };
    return statusMap[status] || { color: '#6b7280', bg: 'bg-gray-500', label: 'Unknown' };
  };

  const formatTime = (timestamp: Date | { seconds: number; nanoseconds: number } | undefined) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-14rem)] w-full rounded-xl overflow-hidden shadow-xl border-2 border-gray-300 relative">
      <Map
        center={mapCenter}
        zoom={mapZoom}
      >
        {/* Online Drivers */}
        {drivers.map((driver) => (
          <MapMarker
            key={`driver-${driver.id}`}
            longitude={driver.location.longitude}
            latitude={driver.location.latitude}
          >
            <MarkerContent>
              <div className="relative">
                <div className="bg-green-500 text-white p-2.5 rounded-full shadow-2xl hover:scale-110 transition-transform border-2 border-white">
                  <Car size={18} />
                </div>
                {driver.status === 'online' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                )}
              </div>
            </MarkerContent>
            <MarkerTooltip>
              <div className="text-sm font-medium min-w-[180px]">
                <div className="font-bold text-gray-900">{driver.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {driver.vehicle?.model} • {driver.vehicle?.plate}
                </div>
                <div className="text-xs text-green-600 font-semibold mt-1">● Available</div>
              </div>
            </MarkerTooltip>
          </MapMarker>
        ))}

        {/* Active Trip Routes - Render in sorted order (selected last = on top) */}
        {filteredTrips
          .map(trip => ({ trip, isSelected: selectedTrip?.id === trip.id }))
          .sort((a, b) => {
            // Non-selected first, selected last (renders on top)
            if (a.isSelected) return 1;
            if (b.isSelected) return -1;
            return 0;
          })
          .map(({ trip, isSelected }) => {
            const statusInfo = getStatusInfo(trip.status);
            const routeCoordinates = tripRoutes[trip.id] || [
              [trip.pickup.longitude, trip.pickup.latitude],
              [trip.destination.longitude, trip.destination.latitude]
            ];
            
            return (
              <MapRoute
                key={`route-${trip.id}`}
                id={`route-${trip.id}`}
                coordinates={routeCoordinates}
                color={isSelected ? '#ef4444' : statusInfo.color}
                width={isSelected ? 6 : 4}
                opacity={isSelected ? 1 : 0.7}
                dashArray={trip.status === 'pending' ? [8, 4] : undefined}
                onClick={() => focusOnTrip(trip)}
              />
            );
          })}

        {/* Active Trip Markers */}
        {filteredTrips.map((trip) => {
          const statusInfo = getStatusInfo(trip.status);
          const isSelected = selectedTrip?.id === trip.id;
          
          return (
            <div key={`trip-${trip.id}`}>

              {/* Pickup Marker */}
              <MapMarker
                longitude={trip.pickup.longitude}
                latitude={trip.pickup.latitude}
                onClick={() => focusOnTrip(trip)}
              >
                <MarkerContent>
                  <div className={`${isSelected ? 'scale-125' : ''} transition-transform`}>
                    <div className={`${statusInfo.bg} text-white p-2 rounded-full shadow-xl cursor-pointer hover:scale-110 transition-transform border-2 border-white`}>
                      <User size={16} />
                    </div>
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  <div className="text-sm min-w-[200px]">
                    <div className="font-bold text-gray-900">{trip.customerName}</div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <MapPin size={12} />
                      {trip.pickup.name}
                    </div>
                    <div className="text-xs mt-2 flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-white font-semibold ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-gray-500">{formatTime(trip.createdAt)}</span>
                    </div>
                    {trip.driverName && (
                      <div className="text-xs mt-2 text-blue-600 font-medium">
                        🚗 {trip.driverName}
                      </div>
                    )}
                  </div>
                </MarkerTooltip>
              </MapMarker>

              {/* Destination Marker */}
              <MapMarker
                longitude={trip.destination.longitude}
                latitude={trip.destination.latitude}
              >
                <MarkerContent>
                  <div className={`${isSelected ? 'scale-125' : ''} transition-transform`}>
                    <div className="bg-red-500 text-white p-2 rounded-full shadow-xl border-2 border-white">
                      <Navigation size={16} />
                    </div>
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  <div className="text-sm min-w-[180px]">
                    <div className="font-bold text-gray-900">Destination</div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Navigation size={12} />
                      {trip.destination.name}
                    </div>
                    <div className="text-xs mt-2 text-green-600 font-bold">
                      £{trip.fare.toFixed(2)}
                    </div>
                  </div>
                </MarkerTooltip>
              </MapMarker>
            </div>
          );
        })}

        {/* Map Controls */}
        <MapControls 
          position="bottom-right" 
          showZoom 
          showLocate 
          showFullscreen
        />
      </Map>

      {/* Live Stats Panel */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-5 border border-gray-200/50 z-10 min-w-[260px]">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          Live Tracking
        </h3>
        
        <div className="space-y-2.5">
          <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full shadow-lg flex items-center justify-center">
                <Car size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Drivers Online</div>
                <div className="text-xl font-bold text-gray-900">{drivers.length}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full shadow-lg flex items-center justify-center">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Active Trips</div>
                <div className="text-xl font-bold text-gray-900">{activeTrips.length}</div>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By Status</div>
            <div className="space-y-1.5">
              {['pending', 'accepted', 'en-route-pickup', 'in-progress'].map(status => {
                const count = activeTrips.filter(t => t.status === status).length;
                const info = getStatusInfo(status);
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      filterStatus === status 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${info.bg}`}></div>
                      <span className="text-xs font-medium">{info.label}</span>
                    </div>
                    <span className="text-xs font-bold">{count}</span>
                  </button>
                );
              })}
            </div>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="w-full mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1"
              >
                <X size={14} />
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected Trip Details Panel */}
      {selectedTrip && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-200/50 z-10 w-96 max-h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Trip Details</h3>
              <p className="text-xs text-gray-500 mt-0.5">ID: {selectedTrip.id.slice(0, 12)}...</p>
            </div>
            <button
              onClick={() => setSelectedTrip(null)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold text-white ${getStatusInfo(selectedTrip.status).bg}`}>
                {getStatusInfo(selectedTrip.status).label}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                {formatTime(selectedTrip.createdAt)}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-xs text-blue-700 font-semibold mb-2">CUSTOMER</div>
              <div className="font-bold text-gray-900 text-base">{selectedTrip.customerName}</div>
              {selectedTrip.customerPhone && (
                <a href={`tel:${selectedTrip.customerPhone}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block">
                  📞 {selectedTrip.customerPhone}
                </a>
              )}
            </div>

            {/* Driver Info */}
            {selectedTrip.driverName && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="text-xs text-green-700 font-semibold mb-2">DRIVER</div>
                <div className="font-bold text-gray-900 text-base">{selectedTrip.driverName}</div>
                {selectedTrip.driverPhone && (
                  <a href={`tel:${selectedTrip.driverPhone}`} className="text-sm text-green-600 hover:text-green-700 font-medium mt-1 inline-block">
                    📞 {selectedTrip.driverPhone}
                  </a>
                )}
              </div>
            )}

            {/* Route Details */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    PICKUP
                  </div>
                  <div className="font-semibold text-gray-900">{selectedTrip.pickup.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {selectedTrip.pickup.latitude.toFixed(4)}, {selectedTrip.pickup.longitude.toFixed(4)}
                  </div>
                </div>
                
                <div className="border-l-2 border-dashed border-gray-300 h-8 ml-1"></div>
                
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                    DESTINATION
                  </div>
                  <div className="font-semibold text-gray-900">{selectedTrip.destination.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {selectedTrip.destination.latitude.toFixed(4)}, {selectedTrip.destination.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="grid grid-cols-2 gap-3">
              {selectedTrip.distance && (
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <div className="text-xs text-purple-700 font-semibold">Distance</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {selectedTrip.distance.toFixed(1)} mi
                  </div>
                </div>
              )}
              {selectedTrip.duration && (
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <div className="text-xs text-orange-700 font-semibold">Duration</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {selectedTrip.duration} min
                  </div>
                </div>
              )}
            </div>

            {/* Fare */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
              <div className="text-sm text-green-700 font-semibold mb-1">FARE AMOUNT</div>
              <div className="text-3xl font-bold text-green-600">£{selectedTrip.fare.toFixed(2)}</div>
              {selectedTrip.paymentMethod && (
                <div className="text-xs text-gray-600 mt-2 capitalize">
                  💳 {selectedTrip.paymentMethod}
                </div>
              )}
            </div>

            {/* Vehicle Type */}
            {selectedTrip.vehicleType && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="text-xs text-gray-600 font-semibold">VEHICLE TYPE</div>
                <div className="text-sm font-bold text-gray-900 mt-1">{selectedTrip.vehicleType}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
