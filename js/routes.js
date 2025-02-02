import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { auth } from "./firebaseInit.js";
import { getCurrentUserData } from "./app.js";

function protectRoute() {
    onAuthStateChanged(auth, (user) => {
        if (!user && (window.location.pathname.includes("dashboard.html") || window.location.pathname.includes("admin.html"))){
            window.location.href = "./login.html";
        }
        else if (user && window.location.pathname.includes("login.html")) {
            getCurrentUserData().then(([uid, dataUser]) => {
                if (dataUser.rol == "cliente") {
                    window.location.href = "dashboard.html";
                } else if (dataUser.rol == "admin") {
                    window.location.href = "admin.html";
                }
            });
        }
    }); 
}

export { protectRoute };