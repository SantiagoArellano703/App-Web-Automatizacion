import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { auth } from "./firebaseInit.js";

function protectRoute() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            if ( window.location.pathname != "/templates/login.html" ){
                window.location.href = "./login.html";
            }
        } else {
            if ( window.location.pathname != "/templates/dashboard.html" ){
                window.location.href = "./dashboard.html";
            }
        }
    });
}

protectRoute();