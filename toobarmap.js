

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        document.getElementById("display-name").textContent = user.displayName || user.email;
        if (user.photoURL) {
          document.getElementById("profile-pic").src = user.photoURL;
        } else {
          try {
            const url = await firebase.storage().ref(`profiles/${user.uid}/profile.jpg`).getDownloadURL();
            document.getElementById("profile-pic").src = url;
          } catch (err) {
            console.log("Sin imagen de perfil");
          }
        }
      } else {
        window.location.href = "login.html";
      }
    });

    function logout() {
      firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
      });
    }

    function saveProfileChanges() {
      const user = firebase.auth().currentUser;
      const newNickname = document.getElementById("nickname-input").value;
      const profilePicInput = document.getElementById("profile-pic-input").files[0];
      if (newNickname) {
        user.updateProfile({ displayName: newNickname });
      }
      if (profilePicInput) {
        const storageRef = firebase.storage().ref(`profiles/${user.uid}/profile.jpg`);
        storageRef.put(profilePicInput).then(() => {
          storageRef.getDownloadURL().then(url => {
            user.updateProfile({ photoURL: url });
            document.getElementById("profile-pic").src = url;
          });
        });
      }
    }