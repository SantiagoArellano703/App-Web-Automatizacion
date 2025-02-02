import { auth } from "./firebaseInit.js";
import { getUser, createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData, validateReservation, getLocalDateString, logout } from "./app.js";
import { protectRoute } from "./routes.js";

// Rutas
protectRoute();

// Constantes
const [uid, currentUser] = await getCurrentUserData();
const tablesDiv = document.getElementById("tables");
welcome();
let tables = await getAllTables();
let reservations = await getAllReservations();
// showTables(tables);
showUserReservations(reservations);
setActualDate();
generateTablesOptions();
let eventsCalendar = hoursToEvents(availabilityHours(reservations, getTableButtonChecked(".tableBtnOption")));
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
        eventsCalendar = hoursToEvents(availabilityHours(reservations, getTableButtonChecked(".tableBtnOption")));
        updateCalendarEvents(eventsCalendar);
        showUserReservations(reservations);
    } catch (error) {
        console.error("Error al obtener reservas:", error);
    } finally {
        isFetching = false; // Libera el bloqueo después de completar la ejecución
    }
}, 3000);


document.querySelectorAll(".tableBtnOption").forEach(button => {
    button.addEventListener("click", () => {
        eventsCalendar = hoursToEvents(availabilityHours(reservations, button.getAttribute('value')));
        updateCalendarEvents(eventsCalendar);
    });
});

// document.querySelectorAll(".reservations-child").forEach(res => {
//     res.addEventListener("click", () => {
//         console.log("GHOLAAa");
//     });
// });

// setTimeout(function() {
//     let alertBox = document.getElementById('alert-box');
//     alertBox.classList.add('fade');
//     alertBox.classList.remove('show');
//   }, 3000);

document.getElementById("closeModal").addEventListener("click", function() {
    document.getElementById("reservation-addOrder").checked = false;
    resetQuantitys();
    showProducts();
});

document.getElementById('submit-reservation').addEventListener('click', function(event) {
    event.preventDefault();
    let [orderSaved, message] = processOrder();
    let alertType = orderSaved ? "success" : "danger";
    resetQuantitys();
    showUserReservations(reservations);

    createAlert(alertType, message);
    setTimeout(function() {
        let alertBox = document.getElementById('alert-box');
        alertBox.classList.add('fade');
        alertBox.classList.remove('show');
        alertBox.remove();
    }, 3000);
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

function createAlert(alertType, message) {
    let alertDiv = document.createElement("div");
    alertDiv.innerHTML = `<div class="alert alert-${alertType} alert-top" role="alert" id="alert-box">
        ${message}
    </div>`;
    document.body.appendChild(alertDiv)
}

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
    let tableButtonsDiv = document.getElementById("tableButtons");
    let formTableBtn = document.getElementById("formTableBtn");
    let count = 1;
    let checked = "checked";

    for (const [id, table] of Object.entries(tables)) {
        let newTableButton = `<input type="radio" class="btn-check tableBtnOption" name="btnradio" id="btnradio${count}" autocomplete="off" ${checked} value=${id}>
                            <label class="btn btn-outline-primary" for="btnradio${count}">Mesa ${count}</label>`;

        tableButtonsDiv.innerHTML += newTableButton;

        let newFormTableBtn =  `<input type="radio" class="btn-check tableFormOpt" name="optTable" id="optTable${count}" autocomplete="off" ${checked} value=${id}>
                            <label class="btn btn-outline-secondary" for="optTable${count}">Mesa ${count}</label>`;

        formTableBtn.innerHTML += newFormTableBtn;

        checked = "";
        count++;
    }
}

function availabilityHours (reservations, tableId) {
    if (!reservations) return [];

    let reservationsForTable = Object.values(reservations).filter(res => res.tableId == tableId);
    let hoursOcuped = [];

    for (let reservation of reservationsForTable) {
        hoursOcuped.push([reservation.date, reservation.startTime, reservation.endTime]);
    }

    hoursOcuped.sort();
    return hoursOcuped;
}

function hoursToEvents(hoursOcuped) {
    if (!hoursOcuped) return;
    return hoursOcuped.map(reservation => ({
        title: "No disponible", 
        start: `${reservation[0]}T${reservation[1]}`,
        end: `${reservation[0]}T${reservation[2]}`, 
        color: "#cdcdcd"
    }));
}

function getTableButtonChecked(className) {
    for (let button of document.querySelectorAll(className)) {
        if (button.checked) {
            return button.getAttribute('value');  // Retorna directamente el ID
        }
    }
    return null;  // Retorna null si ningún botón está seleccionado
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
        themeSystem: 'bootstrap4',
        allDaySlot: false,
        events: eventsCalendar,
        height: 'parent',  // Esto hace que se ajuste al contenedor
        // contentHeight: 'auto', // Altura automática basada en el contenido
        aspectRatio: 1.35
    });
    calendar.render();

    return calendar;
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

        item.innerHTML = `<div><span class="product-name">${product.name}</span>
                        <span class="product-price">$${product.price}</span></div>
                        <div><button type="button" class="quantity-btn btn btn-danger btn-sm" data-action="minus">-</button>
                        <span class="quantity">0</span>
                        <button type="button" class="quantity-btn btn btn-success btn-sm" data-action="plus">+</button><div>`

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
    let table = getTableButtonChecked(".tableFormOpt");
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
        return [true, "Reservacion realizada"];  
    } else {
        console.log("Ya existe una reservacion para esa fecha.");
    }

    return [false, "Fecha inválida"]; 
}


// createTable("Mesa 1", 2);
// createTable("Mesa 2" ,4);
// createTable("Mesa 3", 4);
// createTable("Mesa 4", 4);
// createTable("Mesa 5", 4);

// createReservation('user123', 'table1', '2025-01-16', '19:00');
// let order = [{product: "Pizza Margarita", amount: 1}, {product: "Coca-Cola", amount: 2}]
// createReservation('user123', 'table1', '2025-01-31', '19:00', "21:00", order);
