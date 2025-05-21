// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDXRpeWmji7tJPh3Nqhfv5Z4c8iW9LZVz4",
    authDomain: "dracofabz-c19d1.firebaseapp.com",
    databaseURL: "https://dracofabz-c19d1-default-rtdb.firebaseio.com",
    projectId: "dracofabz-c19d1",
    storageBucket: "dracofabz-c19d1.appspot.com",
    messagingSenderId: "881391272608",
    appId: "1:881391272608:web:d1915a2d8e7f9475b87fc5"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref("LocationsSaved");

// Inicializar el mapa
let map;
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.9671, lng: -89.6237 }, // Coordenadas iniciales
        zoom: 14
    });
    cargarUbicaciones();
}

// Función para agregar ubicaciones a Firebase
document.getElementById("locationForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);
    const iconUrl = document.getElementById("iconUrl").value;
    const mapsLink = document.getElementById("mapsLink").value;

    db.push({
        name,
        latitude,
        longitude,
        iconUrl,
        mapsLink
    });

    alert("Ubicación guardada correctamente.");
    document.getElementById("locationForm").reset();
});

// Función para cargar ubicaciones desde Firebase y mostrarlas en el mapa
function cargarUbicaciones() {
    db.on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.values(data).forEach(location => {
                const marker = new google.maps.Marker({
                    position: { lat: location.latitude, lng: location.longitude },
                    map: map,
                    title: location.name,
                    icon: location.iconUrl ? location.iconUrl : null
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<strong>${location.name}</strong><br><a href="${location.mapsLink}" target="_blank">Ver en Google Maps</a>`
                });

                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });
            });
        }
    });
}
