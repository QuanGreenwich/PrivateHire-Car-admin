// Global data
let allUsers = [];
let allDrivers = [];
let map = null;
let markers = {};

// Initialize app
window.initApp = function() {
    console.log('Initializing app...');
    initMap();
    loadData();
    listenToDriverLocations();
};

// Initialize map
function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-0.1276, 51.5074], // London
        zoom: 12
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
}

// Load data from Firebase
async function loadData() {
    try {
        // Load users
        const usersSnapshot = await window.getDocs(window.collection(window.db, 'users'));
        allUsers = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Load drivers
        const driversSnapshot = await window.getDocs(window.collection(window.db, 'drivers'));
        allDrivers = driversSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        updateStats();
        renderUsers();
        renderDrivers();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="4" class="empty-state">Error loading data</td></tr>';
        document.getElementById('driversTableBody').innerHTML = 
            '<tr><td colspan="4" class="empty-state">Error loading data</td></tr>';
    }
}

// Listen to driver locations for live map
function listenToDriverLocations() {
    window.onSnapshot(window.collection(window.db, 'drivers'), (snapshot) => {
        // Remove old markers
        Object.values(markers).forEach(marker => marker.remove());
        markers = {};

        snapshot.docs.forEach(doc => {
            const driver = doc.data();
            if (driver.location && driver.location.latitude && driver.location.longitude) {
                // Create marker element
                const el = document.createElement('div');
                el.style.cssText = `
                    width: 32px;
                    height: 32px;
                    background: ${driver.status === 'online' ? '#10b981' : '#6b7280'};
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                `;
                el.textContent = (driver.name || 'D').charAt(0).toUpperCase();

                // Create popup
                const popup = new maplibregl.Popup({ offset: 25 })
                    .setHTML(`
                        <div style="padding: 8px;">
                            <strong>${driver.name || 'Unknown'}</strong><br/>
                            <span style="color: ${driver.status === 'online' ? '#10b981' : '#6b7280'}">
                                ${driver.status || 'offline'}
                            </span>
                        </div>
                    `);

                // Add marker to map
                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([driver.location.longitude, driver.location.latitude])
                    .setPopup(popup)
                    .addTo(map);

                markers[doc.id] = marker;
            }
        });
    });
}

// Update stats
function updateStats() {
    document.getElementById('totalUsers').textContent = allUsers.length;
    document.getElementById('totalDrivers').textContent = allDrivers.length;
    document.getElementById('totalAccounts').textContent = allUsers.length + allDrivers.length;
}

// Render users table
function renderUsers(filteredUsers = allUsers) {
    const tbody = document.getElementById('usersTableBody');
    document.getElementById('usersCount').textContent = filteredUsers.length;

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>
                <span class="avatar">${(user.name || 'U').charAt(0).toUpperCase()}</span>
                <strong>${user.name || 'Unknown'}</strong>
            </td>
            <td>📧 ${user.email || '-'}</td>
            <td>📱 ${user.phone || '-'}</td>
            <td>${formatDate(user.createdAt)}</td>
        </tr>
    `).join('');
}

// Render drivers table
function renderDrivers(filteredDrivers = allDrivers) {
    const tbody = document.getElementById('driversTableBody');
    document.getElementById('driversCount').textContent = filteredDrivers.length;

    if (filteredDrivers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No drivers found</td></tr>';
        return;
    }

    tbody.innerHTML = filteredDrivers.map(driver => `
        <tr>
            <td>
                <span class="avatar driver">${(driver.name || 'D').charAt(0).toUpperCase()}</span>
                <strong>${driver.name || 'Unknown'}</strong>
            </td>
            <td>📧 ${driver.email || '-'}</td>
            <td>📱 ${driver.phone || '-'}</td>
            <td>
                <span class="status-badge ${driver.status === 'online' ? 'online' : 'offline'}">
                    ${driver.status || 'offline'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Filter data based on search
function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredUsers = allUsers.filter(user => 
        (user.name || '').toLowerCase().includes(searchTerm) ||
        (user.email || '').toLowerCase().includes(searchTerm)
    );
    
    const filteredDrivers = allDrivers.filter(driver => 
        (driver.name || '').toLowerCase().includes(searchTerm) ||
        (driver.email || '').toLowerCase().includes(searchTerm)
    );
    
    renderUsers(filteredUsers);
    renderDrivers(filteredDrivers);
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-GB');
}

// Show add user modal (placeholder)
function showAddUserModal() {
    alert('Add User feature - To be implemented');
}

// Auto-initialize when Firebase is loaded
setTimeout(() => {
    if (window.db) {
        window.initApp();
    }
}, 500);
