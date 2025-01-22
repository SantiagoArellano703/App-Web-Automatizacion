import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { db } from "./firebaseInit.js";

// Crear una mesa
const createTable = async (capacity, status) => {
    const tablesRef = ref(db, 'tables');
    const newTableRef = push(tablesRef);
    await set(newTableRef, {
        capacity,
        status: 'avaible',
    });
    console.log('Mesa creada:', newTableRef.key);
};

async function getAllTables() {
    try {
      const tablesRef = ref(db, 'tables');
      const snapshot = await get(tablesRef); // Obtener todos los datos de las reservaciones
  
      if (snapshot.exists()) {
        const tables = snapshot.val(); // Aquí tienes todas las reservaciones
        return tables;
      } else {
        console.log("No hay reservaciones en la base de datos.");
      }
    } catch (error) {
      console.error("Error al obtener las reservaciones:", error.message);
    }
  }

// Crear una reservación
const createReservation = async (userId, tableId, date, time) => {
    const reservationsRef = ref(db, 'reservations');
    const newReservationRef = push(reservationsRef);
    console.log(reservationsRef);
    await set(newReservationRef, {
        userId,
        tableId,
        date,
        time,
        status: 'pending',
    });
    console.log('Reservación creada:', newReservationRef.key);
};

async function getAllReservations() {
    try {
      const reservationsRef = ref(db, 'reservations');
      const snapshot = await get(reservationsRef); // Obtener todos los datos de las reservaciones
  
      if (snapshot.exists()) {
        const reservations = snapshot.val(); // Aquí tienes todas las reservaciones

        // for (const [id, reservation] of Object.entries(reservations)) {
        //   console.log(`ID: ${id}, Usuario: ${reservation.userId}, Mesa: ${reservation.tableId}, Fecha: ${reservation.date}, Hora: ${reservation.time}`);
        // }
        return reservations;
      } else {
        console.log("No hay reservaciones en la base de datos.");
      }
    } catch (error) {
      console.error("Error al obtener las reservaciones:", error.message);
    }
  }

export { createTable, createReservation, getAllReservations, getAllTables };
