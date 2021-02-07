const firebase = require("firebase");
let email = "jackfulcher09@gmail.com";
let password = "thispassisrlycool$#%jkls";

var firebaseConfig = {
    apiKey: "AIzaSyA-GcZMzLEVwfJI-HylupvGdcripSsZwKk",
    authDomain: "uottahj.firebaseapp.com",
    projectId: "uottahj",
    storageBucket: "uottahj.appspot.com",
    messagingSenderId: "1041933846009",
    appId: "1:1041933846009:web:e9c2d2c3c37403a2e1a928",
    measurementId: "G-WE716TML8F"
  };


let app = firebase.initializeApp(firebaseConfig);

firebase
  .auth()
  .signInWithEmailAndPassword(email, password)
  .then((cred) => {
    firebase
      .auth()
      .currentUser.getIdToken(true)
      .then(function (idToken) {
        console.log(idToken);
      });
  });
