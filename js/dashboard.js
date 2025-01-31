import { auth } from "./firebaseInit.js";
import { getUser, createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData, validateReservation, logout } from "./app.js";
import { protectRoute } from "./routes.js";

// Rutas
protectRoute();

// Constantes
const [uid, currentUser] = await getCurrentUserData();
const tablesDiv = document.getElementById("tables");
const tablesForm = document.getElementById("reservation-table");
welcome();
let tables = await getAllTables();
let reservations = await getAllReservations();
showTables(tables);
showUserReservations(reservations);
setActualDate();
generateTablesOptions();
let eventsCalendar = hoursToEvents(availabilityHours(reservations, tablesForm.value));
let isFetching = false; 
let calendar = createCalendar();
chargeProducts();

/*-----------------------------------*\
  EVENTOS
\*-----------------------------------*/

setInterval(async () => {
    if (isFetching) return; // Si ya está obteniendo datos, evita otra llamada
    isFetching = true;

    try {
        reservations = await getAllReservations();
        eventsCalendar = hoursToEvents(availabilityHours(reservations, tablesForm.value));
        updateCalendarEvents(eventsCalendar);
        showUserReservations(reservations);
    } catch (error) {
        console.error("Error al obtener reservas:", error);
    } finally {
        isFetching = false; // Libera el bloqueo después de completar la ejecución
    }
}, 5000);

// Abrir el modal
document.getElementById("openModalBtn").addEventListener("click", function() {
    document.getElementById("reservationModal").style.display = "block";
});

// Cerrar el modal
document.getElementById("closeModalBtn").addEventListener("click", function() {
    closeModal();
});

tablesForm.addEventListener("change", function() {
    eventsCalendar = hoursToEvents(availabilityHours(reservations, tablesForm.value));
    updateCalendarEvents(eventsCalendar);
});

document.getElementById('form-reservation').addEventListener('submit', function(event) {
    event.preventDefault();
    processOrder();
    closeModal();
    showUserReservations(reservations);
});

document.getElementById("reservation-addOrder").addEventListener("change", () => {
    showProducts();
});

document.querySelectorAll(".quantity-btn").forEach(button => {
    button.addEventListener("click", () => addProducts(button));
});

document.getElementById("btn-logout").addEventListener("click", function() { logout(auth); });

/*-----------------------------------*\
  FUNCIONES
\*-----------------------------------*/

function welcome() {
    let welcome = document.getElementById("dashboard-welcome");
    welcome.textContent = `Bienvenido ${currentUser.name}`;
}

function showTables(tables) {
    for (const [id, table] of Object.entries(tables)) {
        let newTableDiv = document.createElement("p");
        newTableDiv.textContent = `ID: ${id}, Name: ${table.nameTable} Capacidad: ${table.capacity}, Status: ${table.status}`;
        tablesDiv.appendChild(newTableDiv);
    }
}

function showAllReservations(reservations) {
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

function showUserReservations(reservations) {
    if (!reservations) return;

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

            // Order
            if (reservation.order) {
                for (let order of reservation.order){
                    let orderDiv = document.createElement("p");
                    orderDiv.textContent = `- Producto: ${order.product}, Cantidad: ${order.amount}`;
                    reservationsDiv.appendChild(orderDiv);
                    orderDiv.classList.add("reservations-child");
                }
            } 
        }
    }
}

// Formulario
function getLocalDateString(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() es 0-indexado
    let day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function setActualDate () {
    const dateInput = document.getElementById("reservation-date");
    const now = new Date();
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

    const minHour = 10; 
    const selectedDate = new Date(dateInput.value).toISOString().split("T")[0];

    let currentHour = now.getHours();
    let currentMinutes = now.getMinutes();

    if (selectedDate != today || currentHour < minHour) {
        currentHour = minHour;
        currentMinutes = 0;
    } else {
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

        if (currentMinutes === 0) {
            currentMinutes = 30;
        } else {
            currentMinutes = 0;
            currentHour++;
        }
    }
}

function generateTablesOptions() {
    for (const [id, table] of Object.entries(tables)) {
        let newTableOption = document.createElement("option");
        newTableOption.value = id,
        newTableOption.text = table.nameTable;
        tablesForm.add(newTableOption);
    }
}

function availabilityHours (reservations, tableId) {
    if (!reservations) return [];
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
    if (!hoursOcuped) return;
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
        allDaySlot: false,
        events: eventsCalendar
    });
    calendar.render();

    return calendar;
}

function closeModal() {
    document.getElementById("reservationModal").style.display = "none";
    document.getElementById('reservation-addOrder').checked = false;
    showProducts();
    resetQuantitys();
}

function showProducts() {
    let productList = document.getElementById("productAccordion");
    let addOrder = document.getElementById("reservation-addOrder");
    if (addOrder.checked) {
        productList.style.display = "block"; 
    } else {
        productList.style.display = "none";
    }
}

function chargeProducts() {
    let products = [
        {name: "Yonaguni Roll", price: "7"},
        {name: "Kanagami Roll", price: "7"},
        {name: "Fiji Roll", price: "7"},
        {name: "Asuma Roll", price: "7"},
        {name: "Kakashi Roll", price: "7"},
        {name: "Naruto Roll", price: "7"},
        {name: "Coca-Cola", price: "2"}
    ];

    let accordion = document.getElementById("productAccordion");

    products.forEach(product => {
        let item = document.createElement("div");
        item.classList.add("item-product");
        item.setAttribute("name", product.name);

        item.innerHTML = `<span class="product-name">${product.name}</span>
                        <span class="product-price">$${product.price}</span>
                        <button type="button" class="quantity-btn" data-action="minus">-</button>
                        <span class="quantity">0</span>
                        <button type="button" class="quantity-btn" data-action="plus">+</button>`

        accordion.appendChild(item);
    });
}

function addProducts(button) {
    let quantitySpan = button.parentElement.querySelector(".quantity");
    let quantity = parseInt(quantitySpan.textContent);

    // Controlar la cantidad basada en el botón presionado
    if (button.dataset.action === "plus") {
        quantity++;
    } else if (button.dataset.action === "minus" && quantity > 0) {
        quantity--;
    }

    // Actualizar la cantidad
    quantitySpan.textContent = quantity;
};

function resetQuantitys() {
    document.querySelectorAll(".quantity-btn").forEach(button => {
        let quantitySpan = button.parentElement.querySelector(".quantity");
        quantitySpan.textContent = 0;
    });
};

function processOrder () {
    let table = document.getElementById('reservation-table').value;
    let date = document.getElementById('reservation-date').value;
    let startTime = document.getElementById('reservation-startTime').value;
    let endTime = document.getElementById('reservation-endTime').value;

    //Orden
    let addOrder = document.getElementById('reservation-addOrder').checked;
    let order = [];

    let isValid = validateReservation(reservations, table, date, startTime, endTime);
    
    if( isValid ) {
        if ( addOrder ) {
            let products = document.getElementsByClassName("item-product");

            for (let i = 0; i < products.length; i++){
                let quantity = parseInt(products[i].querySelector(".quantity").textContent);

                if (quantity > 0) {
                    order.push({product: products[i].getAttribute('name'), amount: quantity})
                }
            }   
        }

        createReservation(uid, table, date, startTime, endTime, order);   
        console.log("Reservacion realizada");   
    } else {
        console.log("Ya existe una reservacion para esa fecha.");
    }
}


// createTable("Mesa 1", 2);
// createTable("Mesa 2" ,4);
// createTable("Mesa 3", 4);
// createTable("Mesa 4", 4);
// createTable("Mesa 5", 4);

// createReservation('user123', 'table1', '2025-01-16', '19:00');
// let order = [{product: "Pizza Margarita", amount: 1}, {product: "Coca-Cola", amount: 2}]
// createReservation('user123', 'table1', '2025-01-31', '19:00', "21:00", order);
