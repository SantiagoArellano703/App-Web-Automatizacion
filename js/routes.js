import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { auth } from "./firebaseInit.js";

// function protectRoute() {
//     onAuthStateChanged(auth, (user) => {
//         if (!user) {
//             if ( window.location.pathname != "/templates/login.html" ){
//                 window.location.href = "./login.html";
//             }
//         } else {
//             if ( window.location.pathname != "/templates/dashboard.html" ){
//                 window.location.href = "./dashboard.html";
//             }
//         }
//     });
// }

// protectRoute();

/**
 * Protege la ruta según el estado de autenticación del usuario.
 * @param {string} protectedPage - Página que requiere autenticación (e.g., 'dashboard').
 * @param {string} redirectPage - Página a la que redirigir si el usuario no cumple las condiciones.
 */
function protectRoute(protectedPage, redirectPage) {
    onAuthStateChanged(auth, (user) => {
        if (user && window.location.pathname.includes(protectedPage)) {
            // Si está autenticado y ya está en la página protegida, no hace nada
            console.log("Usuario autenticado, acceso permitido.");
        } else if (!user && window.location.pathname.includes(protectedPage)) {
            // Si no está autenticado y quiere acceder a una página protegida
            console.log("Usuario no autenticado, redirigiendo al login.");
            window.location.href = redirectPage;
        } else if (user && window.location.pathname.includes(redirectPage)) {
            // Si está autenticado e intenta ir al login, redirigir al dashboard
            console.log("Usuario autenticado, redirigiendo al dashboard.");
            window.location.href = protectedPage;
        }
    });
}

export { protectRoute };