let map;
let userLocation = { lat: 0, lng: 0 };
let currentUserId;

// 🔹 1. Inicializar el mapa
async function initMap() {
  const mapElement = document.getElementById("map");

  if (!mapElement) {
    console.error("Elemento del mapa no encontrado.");
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    map = new google.maps.Map(mapElement, {
      center: userLocation,
      zoom: 18,
      minZoom: 14,
      maxZoom: 20,
      mapId: "97c27789eda03e0d5a950670",
      renderingType: "VECTOR",
      tiltInteractionEnabled: false,
      headingInteractionEnabled: false,
      tilt: 50,
      heading: 360,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: false,
      scrollwheel: true,
      disableDoubleClickZoom: true,
      buildingsEnabled: true
    });

    addButtons();
    addUserMarker();
    addAllMarkers();
    loadUserData();
    updateLocationLoop();
    updateFirebaseLoop();
  }, (error) => {
    console.error("Error obteniendo ubicación:", error);
  });
}

// 🔹 2. Cargar la información del jugador desde Firebase
function loadUserData() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUserId = user.uid;
    }
  });
}

// 🔹 3. Agregar la posición del jugador en el mapa
function addUserMarker() {
  new google.maps.Marker({
    position: { 
      lat: userLocation.lat, 
      lng: userLocation.lng + 0.00001 
    },
    map: map,
    icon: {
      url: "/shadow.png",
      scaledSize: new google.maps.Size(25, 15),
      anchor: new google.maps.Point(12.5, 9) 
    },
    zIndex: 1
  });

  new google.maps.Marker({
    position: userLocation,
    map: map,
    title: "Player",
    label: {
      text: "You",
      color: "#FF4F52",
      fontWeight: "bold",
      fontSize: "14px",
      className: "map-label"
    },
    icon: {
      url: "/pinPlayer.png",
      scaledSize: new google.maps.Size(150, 150)
    },
    zIndex: 10
  });
}

// 🔹 4. Actualizar la posición del jugador en Firebase
function updateUserLocation(userId, latitude, longitude) {
  const userRef = firebase.database().ref(`userlocations/${userId}`);

  userRef.update({
    latitude: latitude,
    longitude: longitude
  }).then(() => console.log(`Ubicación actualizada para ${userId}`))
    .catch(error => console.error("Error actualizando ubicación en Firebase:", error));
}

// 🔹 5. Agregar los botones personalizados
function addButtons() {
  const buttons = [
    ["rightarrow.png", "rotate", 45, google.maps.ControlPosition.RIGHT_CENTER],
    ["leftarrow.png", "rotate", -45, google.maps.ControlPosition.LEFT_CENTER]
  ];

  buttons.forEach(([icon, mode, amount, position]) => {
    const controlDiv = document.createElement("div");
    const controlUI = document.createElement("button");

    controlUI.classList.add("ui-button");
    controlUI.style.background = `url(${icon}) no-repeat center`;
    controlUI.style.backgroundSize = "contain";
    controlUI.style.width = "80px"; 
    controlUI.style.height = "80px";
    controlUI.style.border = "none";
    controlUI.style.cursor = "pointer";

    controlUI.addEventListener("click", () => {
      const newHeading = map.getHeading() + amount;
      map.setHeading(newHeading);
    });

    controlDiv.appendChild(controlUI);
    map.controls[position].push(controlDiv);
  });
}

// 🔹 6. Agregar los marcadores (tiendas y jugadores)
function addAllMarkers() {
  // 🔴 Cargar tiendas desde Firebase
  const dbRef = firebase.database().ref("locations");
  dbRef.once("value").then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();

      const marker = new google.maps.Marker({
        position: { lat: data.lat, lng: data.lng },
        map: map,
        title: "TCG",
        label: {
          text: data.name,
          color: "#DCD70B",
          fontWeight: "bold",
          fontSize: "24px",
          className: "map-label"
        },
        icon: {
          url: "/pinTCG.png",
          scaledSize: new google.maps.Size(260, 260),
          anchor: new google.maps.Point(130, 240)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<strong>${data.name}</strong><br><a href="${data.googleMapsUrl}" target="_blank">${data.description}</a>`
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });
  });

  // 🔴 Cargar jugadores
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userLocationsRef = firebase.database().ref("userlocations");

      userLocationsRef.once("value").then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();

          if (data.userId !== currentUserId) {
            const marker = new google.maps.Marker({
              position: { lat: data.latitude, lng: data.longitude },
              map: map,
              title: "Player",
              label: {
                text: data.nickname || data.name,
                color: "#FF4F52",
                fontWeight: "bold",
                fontSize: "14px",
                className: "map-label"
              },
              icon: {
                url: "/pinPlayer.png",
                scaledSize: new google.maps.Size(150, 150),
                anchor: new google.maps.Point(75, 140)
              }
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `<strong>${data.nickname || data.name}</strong><br>`
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });
          }
        });
      });
    }
  });
}

// 🔹 7. Actualizar la ubicación cada 10 segundos
function updateLocationLoop() {
  setInterval(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      userLocation.lat = position.coords.latitude;
      userLocation.lng = position.coords.longitude;
    });
  }, 10000);
}

// 🔹 8. Actualizar Firebase cada 10 segundos
function updateFirebaseLoop() {
  setInterval(() => {
    if (currentUserId) {
      updateUserLocation(currentUserId, userLocation.lat, userLocation.lng);
    }
  }, 10000);
}

document.addEventListener("DOMContentLoaded", initMap);

// 🔴 Ocultar controles predeterminados de Google Maps
const removeControls = setInterval(() => {
  document.querySelectorAll('.gm-control-active, .gmnoprint, .gm-style-cc').forEach(element => {
    element.style.display = "none";
  });
}, 100);

setTimeout(() => {
  clearInterval(removeControls);
}, 20000);
