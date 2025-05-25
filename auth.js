document.getElementById("googleLogin").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      if (!user) {
        alert("No se pudo obtener la información del usuario.");
        return;
      }

      const uid = user.uid;
      const userRef = firebase.database().ref("users/" + uid);

      userRef.once("value").then((snapshot) => {
        if (!snapshot.exists()) {
          // 🔹 El usuario es nuevo, crear su registro en Firebase
          const userData = {
            userId: uid,
            nickname: user.displayName || "Sin apodo",
            name: user.displayName || "Sin nombre",
          };

          userRef.set(userData)
            .then(() => console.log(`Nuevo usuario registrado en Firebase:`, userData))
            .catch(error => console.error("❌ Error al registrar usuario en Firebase:", error));
        } else {
          console.log("ℹ️ Usuario ya registrado en Firebase.");
        }

        // Redirigir al mapa
        //window.location.href = "/map";
		setTimeout(() => {
			window.location.href = "/map";
		  }, 1000);
      }).catch(error => {
        console.error("❌ Error verificando usuario en Firebase:", error);
        //window.location.href = "/map"; // Si falla, igual redirigir al mapa
		setTimeout(() => {
			window.location.href = "/map";
		  }, 1000);
      });
    })
    .catch((error) => {
      console.error("❌ Error de autenticación:", error);
      alert("Error al iniciar sesión con Google.");
    });
});


document.getElementById("skipLogin").addEventListener("click", () => {
	  //window.location.href = "/map";
	  setTimeout(() => {
		window.location.href = "/map";
	  }, 1000);
});
