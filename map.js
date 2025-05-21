// --- Inicializar Mapa ---
let map = L.map('map', {
  zoomControl: true,
  minZoom: 14,
  maxZoom: 18
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '',
}).addTo(map);

// --- Crear ícono con foto y nombre ---
function createUserMarker(user, latlng) {
  const img = document.createElement('img');
  img.src = user.photoURL;
  img.className = 'user-marker';

  const icon = L.divIcon({
    html: img.outerHTML,
    iconSize: [40, 40],
    className: ''
  });

  const marker = L.marker(latlng, { icon }).addTo(map);

  marker.bindPopup(`<small>${user.name}</small>`, { closeButton: false });
  marker.openPopup();

  return marker;
}

let currentMarker;

// --- Obtener ubicación y actualizar Firebase ---
function updateLocation() {
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const latlng = [latitude, longitude];

    map.setView(latlng, 16);
    
    if (currentMarker) currentMarker.remove();
    currentMarker = createUserMarker(user, latlng);

    // Guardar en Firebase
    db.ref('locations/' + user.id).set({
      name: user.name,
      photoURL: user.photoURL,
      lat: latitude,
      lng: longitude,
      timestamp: Date.now()
    });
  });
}

// --- Cargar otros usuarios cerca ---
function loadNearbyUsers() {
  db.ref('locations').on('value', snapshot => {
    const data = snapshot.val();
    if (!data) return;

    Object.keys(data).forEach(uid => {
      if (uid === user.id) return;

      const u = data[uid];
      const distance = getDistanceFromLatLonInKm(currentMarker.getLatLng().lat, currentMarker.getLatLng().lng, u.lat, u.lng);
      if (distance <= 1) {
        createUserMarker(u, [u.lat, u.lng]);
      }
    });
  });
}

// --- Distancia entre 2 coordenadas (Haversine) ---
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// --- Ciclo de actualización ---
updateLocation();
loadNearbyUsers();
setInterval(updateLocation, 60000); // cada 1 minuto