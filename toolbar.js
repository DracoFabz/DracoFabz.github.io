firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const uid = user.uid;
  const userInfo = document.getElementById("user-info");
  const profilePic = document.getElementById("profile-pic");
  const displayName = document.getElementById("display-name");
  const dropdown = document.getElementById("user-dropdown");

  // Mostrar dropdown
  userInfo.addEventListener("click", () => {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });

  // Cargar datos desde Firebase Database
  const userRef = firebase.database().ref("users/" + uid);
  userRef.once("value").then((snapshot) => {
    const data = snapshot.val();

    // Verificar que existen los datos antes de asignarlos
    const name = data?.nickname || user.displayName || "Usuario";
    const photo = data?.photoURL || user.photoURL || "https://via.placeholder.com/40";
    const description = data?.description || "Sin descripción";
    const phone = data?.phone || "No proporcionado";
    const rating = data?.rating || 0;
    const currentUserID = data?.userId || uid;

    profilePic.src = photo;
    displayName.textContent = name;

    console.log("User Data:", { currentUserID, name, description, phone, rating });

  }).catch((error) => {
    console.error("Error leyendo datos del usuario en Firebase:", error);
  });
});

// Guardar cambios de perfil
async function saveProfileChanges() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const uid = user.uid;
  const nickname = document.getElementById("nickname-input").value.trim();
  const fileInput = document.getElementById("profile-pic-input");
  const file = fileInput.files[0];

  const updates = {};

  if (nickname) {
    updates.nickname = nickname;
  }

  if (file) {
    const storageRef = firebase.storage().ref(`profile_pictures/${uid}`);
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();
    updates.photoURL = downloadURL;
  }

  await firebase.database().ref("users/" + uid).update(updates);
  alert("Perfil actualizado");
  location.reload();
}

// Cerrar sesion
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "/login.html";
  });
}
