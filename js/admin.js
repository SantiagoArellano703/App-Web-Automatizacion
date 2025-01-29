import { auth } from "./firebaseInit.js";
import { createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData, validateReservation, logout } from "./app.js";
import { protectRoute } from "./routes.js";

protectRoute();
const [uid, currentUser] = await getCurrentUserData();

document.getElementById("btn-logout").addEventListener("click", function() { logout(auth); });


async function welcome() {
    let welcome = document.getElementById("dashboard-welcome");
    welcome.textContent = `Bienvenido ${currentUser.name}`;
}

welcome();