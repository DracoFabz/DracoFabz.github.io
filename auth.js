document.getElementById("googleLogin").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Usuario autenticado con éxito
      window.location.href = "/home";
    })
    .catch((error) => {
      console.error("Error de autenticación:", error);
      alert("Error al iniciar sesión con Google.");
    });
});

document.getElementById("skipLogin").addEventListener("click", () => {
  window.location.href = "/home";
});
