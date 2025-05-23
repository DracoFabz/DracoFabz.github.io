 const firebaseConfig = {
      apiKey: "AIzaSyDXRpeWmji7tJPh3Nqhfv5Z4c8iW9LZVz4",
      authDomain: "dracofabz-c19d1.firebaseapp.com",
      databaseURL: "https://dracofabz-c19d1-default-rtdb.firebaseio.com",
      projectId: "dracofabz-c19d1",
      storageBucket: "dracofabz-c19d1.appspot.com",
      messagingSenderId: "881391272608",
      appId: "1:881391272608:web:d1915a2d8e7f9475b87fc5"
    };
    firebase.initializeApp(firebaseConfig);

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