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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.getElementById("locationForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);
  const description = document.getElementById("description").value.trim();
  const googleMapsUrl = document.getElementById("googleMapsUrl").value.trim();

  if (!name || isNaN(lat) || isNaN(lng) || !description || !googleMapsUrl) {
    document.getElementById("message").textContent = "Por favor, completa todos los campos correctamente.";
    return;
  }

  const newLocationRef = db.ref("locations").push();
  newLocationRef.set({
    name,
    lat,
    lng,
    description,
    googleMapsUrl
  })
  .then(() => {
    document.getElementById("message").textContent = "Ubicación guardada exitosamente.";
    document.getElementById("locationForm").reset();
  })
  .catch((error) => {
    console.error("Error al guardar:", error);
    document.getElementById("message").textContent = "Error al guardar la ubicación.";
  });
});
