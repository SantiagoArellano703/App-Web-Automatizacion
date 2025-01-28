import { auth } from "./firebaseInit.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData } from "./app.js";
import { protectRoute } from "./routes.js";

// let userData = await protectRoute();
// console.log(userData);

const [uid, currentUser] = await getCurrentUserData();

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
    let welcome = document.getElementById("dashboard-welcome");
    welcome.textContent = `Bienvenido ${currentUser.name}`;
}

welcome();

// Llama a esta función con los datos correctos
// createTable("Mesa 1", 2);
// createTable("Mesa 2" ,4);
// createTable("Mesa 3", 4);
// createTable("Mesa 4", 4);
// createTable("Mesa 5", 4);

// createReservation('user123', 'table1', '2025-01-16', '19:00');

let tables = await getAllTables();

const tablesDiv = document.getElementById("tables");
const tablesForm = document.getElementById("reservation-table");

for (const [id, table] of Object.entries(tables)) {
    let newTableDiv = document.createElement("p");
    newTableDiv.textContent = `ID: ${id}, Name: ${table.nameTable} Capacidad: ${table.capacity}, Status: ${table.status}`;
    tablesDiv.appendChild(newTableDiv);

    let newTableOption = document.createElement("option");
    newTableOption.value = id,
    newTableOption.text = table.nameTable;
    tablesForm.add(newTableOption);
}

async function showAllReservations() {
    let reservations = await getAllReservations();

    let childs = document.getElementsByClassName("reservations-child");

    if (childs.length > 0) {
        let numChilds = childs.length;
        for (let i = 0; i < numChilds; i++) {
            childs[0].remove();
        }
    }

    const reservationsDiv = document.getElementById("reservations");

    for (const [id, reservation] of Object.entries(reservations)) {
        let newReservationsDiv = document.createElement("p");
        
        newReservationsDiv.textContent = `ID: ${id}, Usuario: ${reservation.userId}, Mesa: ${reservation.tableId}, Fecha: ${reservation.date}, Hora: ${reservation.time}`;
        reservationsDiv.appendChild(newReservationsDiv);
        newReservationsDiv.classList.add("reservations-child");
    }
}

async function showUserReservations() {
    let reservations = await getAllReservations();

    let childs = document.getElementsByClassName("reservations-child");

    if (childs.length > 0) {
        let numChilds = childs.length;
        for (let i = 0; i < numChilds; i++) {
            childs[0].remove();
        }
    }

    const reservationsDiv = document.getElementById("reservations");

    for (const [id, reservation] of Object.entries(reservations)) {
        if (reservation.userId == uid) {
            let newReservationsDiv = document.createElement("p");
            newReservationsDiv.textContent = `ID: ${id}, Usuario: ${reservation.userId}, Mesa: ${reservation.tableId}, 
                                                Fecha: ${reservation.date}, Hora: ${reservation.startTime}, Fin: ${reservation.endTime}`;
            reservationsDiv.appendChild(newReservationsDiv);
            newReservationsDiv.classList.add("reservations-child");
        }
    }
}

showUserReservations();


// Formulario

function setActualDate () {
    // const dateInput = document.getElementById("reservation-date");
    // const today = new Date().toISOString().split("T")[0];
    // dateInput.setAttribute("min", today);
    // console.log("Entra today");

    const dateInput = document.getElementById("reservation-date");
    const timeInput = document.getElementById("reservation-startTime");

    // Establecer la fecha mínima
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);

    dateInput.addEventListener("change", () => {
        console.log("Entra today");
        const selectedDate = new Date(dateInput.value).toISOString().split("T")[0];
        if (selectedDate === today) {
            // Limitar la hora si es el mismo día
            console.log("Entra today");
            const now = new Date();
            const currentTime = now.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });
            timeInput.setAttribute("min", currentTime);
        } else {
            // Quitar la restricción de hora para días futuros
            timeInput.setAttribute("min", "9:00");
        }
    });
}
    
setActualDate();

document.getElementById('form-reservation').addEventListener('submit', function(event) {
    event.preventDefault();

    let table = document.getElementById('reservation-table').value;
    let date = document.getElementById('reservation-date').value;
    let startTime = document.getElementById('reservation-startTime').value;
    let endTime = document.getElementById('reservation-endTime').value;

    createReservation(uid, table, date, startTime, endTime);
    showUserReservations();
});

