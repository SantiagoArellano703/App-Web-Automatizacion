import { auth } from "./firebaseInit.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData } from "./app.js";
import { protectRoute } from "./routes.js";

let userData = await protectRoute();
console.log(userData);

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

async function welcome() {
    let currentUser = await getCurrentUserData();

    let welcome = document.getElementById("dashboard-welcome");
    welcome.textContent = `Bienvenido ${currentUser.name}`;
}

welcome();

// Llama a esta función con los datos correctos
// createTable(2);
// createTable(4);
// createTable(4);
// createTable(4);
// createTable(4);

// createReservation('user123', 'table1', '2025-01-16', '19:00');

let tables = await getAllTables();

const tablesDiv = document.getElementById("tables");

for (const [id, table] of Object.entries(tables)) {
    let newTableDiv = document.createElement("p");
    newTableDiv.textContent = `ID: ${id}, Capacidad: ${table.capacity}, Status: ${table.status}`;
    tablesDiv.appendChild(newTableDiv);
}


let reservations = await getAllReservations();

const reservationsDiv = document.getElementById("reservations");

for (const [id, reservation] of Object.entries(reservations)) {
    let newReservationsDiv = document.createElement("p");
    newReservationsDiv.textContent = `ID: ${id}, Usuario: ${reservation.userId}, Mesa: ${reservation.tableId}, Fecha: ${reservation.date}, Hora: ${reservation.time}`;
    reservationsDiv.appendChild(newReservationsDiv);
}

