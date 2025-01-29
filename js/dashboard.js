import { auth } from "./firebaseInit.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData, validateReservation } from "./app.js";
import { protectRoute } from "./routes.js";

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

// createTable("Mesa 1", 2);
// createTable("Mesa 2" ,4);
// createTable("Mesa 3", 4);
// createTable("Mesa 4", 4);
// createTable("Mesa 5", 4);

// createReservation('user123', 'table1', '2025-01-16', '19:00');

let tables = await getAllTables();
let reservations;

const tablesDiv = document.getElementById("tables");
const tablesForm = document.getElementById("reservation-table");

for (const [id, table] of Object.entries(tables)) {
    let newTableDiv = document.createElement("p");
    newTableDiv.textContent = `ID: ${id}, Name: ${table.nameTable} Capacidad: ${table.capacity}, Status: ${table.status}`;
    tablesDiv.appendChild(newTableDiv);
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
    reservations = await getAllReservations();

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

await showUserReservations();


// Formulario

function getLocalDateString(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() es 0-indexado
    let day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function setActualDate () {
    const dateInput = document.getElementById("reservation-date");

    // Establecer la fecha mínima
    const now = new Date();
    // const today = now.toISOString().split("T")[0];
    const today = getLocalDateString(now);
    dateInput.setAttribute("min", today);
    dateInput.value = today;

    dateInput.addEventListener("change", () => {
        setSelectHours(dateInput, now, today);
    });
    
    setSelectHours(dateInput, now, today);
}

function setSelectHours (dateInput, now, today) {
    const timeInputStart = document.getElementById("reservation-startTime");
    const timeInputEnd = document.getElementById("reservation-endTime");

    let childs = document.getElementsByClassName("hourOption");

    if (childs.length > 0) {
        let numChilds = childs.length;
        for (let i = 0; i < numChilds; i++) {
            childs[0].remove();
        }
    }

    // Definir la hora mínima (ej. 4:00 PM -> 16:00)
    const minHour = 10; // 4:00 PM en formato 24h
    const selectedDate = new Date(dateInput.value).toISOString().split("T")[0];

    let currentHour = now.getHours();
    let currentMinutes = now.getMinutes();

    // Si la hora actual es menor a la mínima, comenzamos desde la mínima
    if (selectedDate != today || currentHour < minHour) {
        currentHour = minHour;
        currentMinutes = 0;
    } else {
        // Ajustar para comenzar en el siguiente intervalo de 30 minutos
        if (currentMinutes < 30) {
            currentMinutes = 30;
        } else {
            currentHour += 1;
            currentMinutes = 0;
        }
    }

    // Generar opciones hasta la medianoche
    while (currentHour < 24) {
        const hour12 = currentHour > 12 ? currentHour - 12 : currentHour;
        const ampm = currentHour >= 12 ? "PM" : "AM";

        let option = document.createElement("option");
        let optionEnd = document.createElement("option");
        option.value = `${currentHour}:${currentMinutes.toString().padStart(2, "0")}`;
        option.textContent = `${hour12}:${currentMinutes.toString().padStart(2, "0")} ${ampm}`;
        option.classList.add("hourOption");
        optionEnd.value = `${currentHour}:${currentMinutes.toString().padStart(2, "0")}`;
        optionEnd.textContent = `${hour12}:${currentMinutes.toString().padStart(2, "0")} ${ampm}`;
        optionEnd.classList.add("hourOption");
        timeInputStart.appendChild(option);
        timeInputEnd.appendChild(optionEnd);            

        // Avanzar 30 minutos
        if (currentMinutes === 0) {
            currentMinutes = 30;
        } else {
            currentMinutes = 0;
            currentHour++;
        }
    }
}

async function generateTablesOptions() {
    for (const [id, table] of Object.entries(tables)) {
        let newTableOption = document.createElement("option");
        newTableOption.value = id,
        newTableOption.text = table.nameTable;
        tablesForm.add(newTableOption);
    }
}

function availabilityHours (reservations, tableId) {
    let reservationsForTable = Object.values(reservations).filter(res => res.tableId == tableId);
    let hoursOcuped = [];
    let calendar = document.getElementById("calendar");

    for (let reservation of reservationsForTable) {
        hoursOcuped.push([reservation.date, reservation.startTime, reservation.endTime]);
    }

    hoursOcuped.sort();
    return hoursOcuped;
}

function hoursToEvents(hoursOcuped) {
    return hoursOcuped.map(reservation => ({
        title: "Reservado", 
        start: `${reservation[0]}T${reservation[1]}`,
        end: `${reservation[0]}T${reservation[2]}`, 
        color: "#cdcdcd"
    }));
}

function updateCalendarEvents(eventsCalendar) {
    if (!calendar) return;

    calendar.removeAllEvents(); // Eliminar eventos previos
    calendar.addEventSource(eventsCalendar); // Agregar nuevos eventos
}

setActualDate();
generateTablesOptions();
let eventsCalendar = hoursToEvents(availabilityHours(reservations, tablesForm.value));

let isFetching = false; // Variable para evitar llamadas superpuestas

setInterval(async () => {
    if (isFetching) return; // Si ya está obteniendo datos, evita otra llamada
    isFetching = true;

    try {
        const reservations = await getAllReservations();
        eventsCalendar = hoursToEvents(availabilityHours(reservations, tablesForm.value));
        updateCalendarEvents(eventsCalendar);
    } catch (error) {
        console.error("Error al obtener reservas:", error);
    } finally {
        isFetching = false; // Libera el bloqueo después de completar la ejecución
    }
}, 5000);

console.log(eventsCalendar);

tablesForm.addEventListener("change", function() {
    eventsCalendar = hoursToEvents(availabilityHours(reservations, tablesForm.value));
    updateCalendarEvents(eventsCalendar);
});

document.getElementById('form-reservation').addEventListener('submit', function(event) {
    event.preventDefault();

    let table = document.getElementById('reservation-table').value;
    let date = document.getElementById('reservation-date').value;
    let startTime = document.getElementById('reservation-startTime').value;
    let endTime = document.getElementById('reservation-endTime').value;

    let isValid = validateReservation(reservations, table, date, startTime, endTime);
    
    if( isValid ) {
        createReservation(uid, table, date, startTime, endTime);   
        console.log("Reservacion realizada");   
    } else {
        console.log("Ya existe una reservacion para esa fecha.");
    }
 
    showUserReservations();
});


function createCalendar() {
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        slotMinTime: "10:00:00",
        locale: "local",
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: true,
            hour12: true,
            meridiem: "short"
        },

        events: eventsCalendar
    });
    calendar.render();

    return calendar;
}

let calendar = createCalendar();


