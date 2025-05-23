async function initMap() {
  const { Map, RenderingType } = await google.maps.importLibrary("maps");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      const map = new Map(document.getElementById("map"), {
        center: userLocation,
        zoom: 18,
        minZoom: 17,
        maxZoom: 20,
        mapId: "97c27789eda03e0d5a950670",
        renderingType: RenderingType.VECTOR,
        tiltInteractionEnabled: false,
        headingInteractionEnabled: true,
        tilt: 50,
        heading: 360,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
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
  controlUI.style.width = "40px"; 
  controlUI.style.height = "40px";
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
    },
    (error) => {
      alert("No se pudo obtener la ubicación.");
      console.error("Error obteniendo ubicación:", error);
    }
  );
}
window.onload = initMap;
