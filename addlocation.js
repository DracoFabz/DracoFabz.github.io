// Configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
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
  const coordinates = document.getElementById("coordinates").value.trim();
  const description = document.getElementById("description").value.trim();
  const googleMapsUrl = document.getElementById("googleMapsUrl").value.trim();

  if (!name || !coordinates || !description || !googleMapsUrl) {
    document.getElementById("message").textContent = "Por favor, completa todos los campos correctamente.";
    return;
  }

  // Dividir las coordenadas en latitud y longitud
  const coordsArray = coordinates.split(",");
  if (coordsArray.length !== 2) {
    document.getElementById("message").textContent = "Formato de coordenadas incorrecto. Usa latitud,longitud.";
    return;
  }

  const lat = parseFloat(coordsArray[0].trim());
  const lng = parseFloat(coordsArray[1].trim());

  if (isNaN(lat) || isNaN(lng)) {
    document.getElementById("message").textContent = "Las coordenadas deben ser números válidos.";
    return;
  }

  // Guardar en Firebase
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
