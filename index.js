firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // Usuario autenticado → redirigir a /home
    window.location.href = "/home";
  } else {
    // No autenticado → redirigir a /login.html
    window.location.href = "/login.html";
  }
});
