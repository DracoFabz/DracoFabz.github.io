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
        minZoom: 14,
        maxZoom: 19,
        mapId: "97c27789eda03e0d5a950670",
        renderingType: RenderingType.VECTOR,
        tiltInteractionEnabled: true,
        headingInteractionEnabled: true,
        tilt: 75,
        heading: 360,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: true,
        buildingsEnabled: true
      });

      // Botones para rotar
		const buttons = [
		  ["Rotate Left", "rotate", 20, google.maps.ControlPosition.RIGHT_CENTER],
		  ["Rotate Right", "rotate", -20, google.maps.ControlPosition.LEFT_CENTER],
		  ["Tilt Up", "tilt", -10, google.maps.ControlPosition.TOP_CENTER],
		  ["Tilt Down", "tilt", 10, google.maps.ControlPosition.BOTTOM_CENTER]
		];

      buttons.forEach(([text, mode, amount, position]) => {
        const controlDiv = document.createElement("div");
        const controlUI = document.createElement("button");

        controlUI.classList.add("ui-button");
        controlUI.innerText = text;
        controlUI.addEventListener("click", () => {
          adjustMap(mode, amount);
        });
        controlDiv.appendChild(controlUI);
        map.controls[position].push(controlDiv);
      });

      function adjustMap(mode, amount) {
        if (mode === "tilt") {
          map.setTilt(map.getTilt() + amount);
        } else if (mode === "rotate") {
          map.setHeading(map.getHeading() + amount);
        }
      }

      // Agrega marcador de usuario
      new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Tú",
        label: {
          text: "Tú",
          color: "#000000",
          fontWeight: "bold",
          fontSize: "14px"
        },
        icon: {
          url: "https://raw.githubusercontent.com/DracoFabz/DracoFabz.github.io/refs/heads/main/pinYou.png",
          scaledSize: new google.maps.Size(60, 60)
        }
      });

      //  Obtener ubicaciones desde Firebase y generar marcadores
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
              color: "#0C5474",
              fontWeight: "bold",
              fontSize: "14px",
              className: "map-label"
            },
            icon: {
              url: "https://raw.githubusercontent.com/DracoFabz/DracoFabz.github.io/refs/heads/main/pinTCG.png",
              scaledSize: new google.maps.Size(60, 60)
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
