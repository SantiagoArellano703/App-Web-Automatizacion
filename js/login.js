import { createUserWithEmailAndPassword, signInWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { auth } from "./firebaseInit.js";

document.getElementById('form-register').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;

    registerUser(email, password);
    
});

document.getElementById('form-login').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    loginUser(email, password);
    
});

function registerUser (email, password) {
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        console.log(user.uid);
        window.location.href = "./dashboard.html"; 
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    });
}

function loginUser (email, password) {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        console.log(user.uid);
        window.location.href = "./dashboard.html"; 
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    });
}

