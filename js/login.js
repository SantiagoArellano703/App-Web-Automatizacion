import { createUserWithEmailAndPassword, signInWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { auth } from "./firebaseInit.js";
import { createUser } from "./app.js";
import { protectRoute } from "./routes.js";

protectRoute();

document.getElementById('form-register').addEventListener('submit', function(event) {
    event.preventDefault();

    let email = document.getElementById('email-register').value;
    let password = document.getElementById('password-register').value;
    let name = document.getElementById('username').value;
    let lastname = document.getElementById('lastname').value;

    registerUser(email, password, name, lastname);
    
});

document.getElementById('form-login').addEventListener('submit', function(event) {
    event.preventDefault();

    let email = document.getElementById('email-login').value;
    let password = document.getElementById('password-login').value;

    loginUser(email, password);
});

function registerUser (email, password, name, lastname) {
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        let user = userCredential.user;
        console.log(user);
        createUser(user, email, name, lastname, "cliente").then(() => { window.location.href = "./dashboard.html"; });
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
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    });
}