import { auth } from "./firebaseInit.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

document.getElementById("btn-logout").addEventListener("click", logout);

function logout() {
    signOut(auth)
    .then(() => {
        // La sesión se cerró correctamente
        console.log("Sesión cerrada exitosamente.");
        window.location.href = "./index.html"; // Redirigir al login
    })
    .catch((error) => {
        // Manejar errores
        console.error("Error al cerrar sesión:", error);
    });
}