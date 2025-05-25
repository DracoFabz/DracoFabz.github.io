async function initMap() {
  const mapElement = document.getElementById("map");

  // Verifica si el elemento existe
  if (!mapElement) {
    console.error("Elemento del mapa no encontrado.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      const map = new google.maps.Map(mapElement, {
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

      // Agrega marcador de usuario
      const shadowMarker = new google.maps.Marker({
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

      const playerMarker = new google.maps.Marker({
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

      // Función para actualizar la posición en tiempo real
      function updatePosition(position) {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        playerMarker.setPosition(userLocation);
        shadowMarker.setPosition({ 
          lat: userLocation.lat, 
          lng: userLocation.lng + 0.00001 
        });

        map.setCenter(userLocation);
      }

      // Monitorea cambios de ubicación constantemente
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updatePosition, (error) => {
          console.error("Error obteniendo ubicación:", error);
        }, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        });
      } else {
        console.error("Geolocalización no soportada en este navegador.");
      }

      // 🔴 Cargar tiendas desde Firebase Database
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
      }).catch((error) => {
        console.error("Error leyendo ubicaciones desde Firebase:", error);
      });

      // 🔴 Obtener el User ID del usuario autenticado
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          const currentUserId = user.uid;

          // Código para poner a los demás jugadores
          const userLocationsRef = firebase.database().ref("userlocations");

          userLocationsRef.once("value").then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();

              // Filtrar para que no agregue el marcador del usuario actual
              if (data.userId !== currentUserId) {
                const marker = new google.maps.Marker({
                  position: { lat: data.latitude, lng: data.longitude },
                  map: map,
                  title: "Player",
                  label: {
                    text: data.nickname,
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
          }).catch((error) => {
            console.error("Error leyendo ubicaciones de usuarios desde Firebase:", error);
          });

          // 🔄 Actualizar la ubicación del usuario en Firebase
          if (navigator.geolocation) {
            navigator.geolocation.watchPosition((position) => {
              updateUserLocation(
                currentUserId,
                user.displayName || "Sin apodo",
                user.displayName || "Sin nombre",
                position.coords.latitude,
                position.coords.longitude,
                "Jugador competitivo",
                "+52 9991234567",
                5
              );
            }, (error) => {
              console.error("Error obteniendo ubicación:", error);
            }, {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000
            });
          }
        }
      });
    },
    (error) => {
      alert("No se pudo obtener la ubicación.");
      console.error("Error obteniendo ubicación:", error);
    }
  );
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
