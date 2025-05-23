firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // Usuario autenticado → redirigir a /home
    window.location.href = "/map";
  } else {
    // No autenticado → redirigir a /login.html
    window.location.href = "/login.html";
  }
});
