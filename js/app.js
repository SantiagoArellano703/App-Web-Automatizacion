import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { db, auth } from "./firebaseInit.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Crear usuario
const createUser = async (user, email, name, lastname) => {
  const newUserRef = ref(db, `users/${user.uid}`);
  await set(newUserRef, {
      email,
      name,
      lastname
  });
  console.log('Usuario creado:', newUserRef.key);
};

// Crear una mesa
const createTable = async (nameTable, capacity, status) => {
    const tablesRef = ref(db, 'tables');
    const newTableRef = push(tablesRef);
    await set(newTableRef, {
        nameTable,
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
const createReservation = async (userId, tableId, date, startTime, endTime) => {
    const reservationsRef = ref(db, 'reservations');
    const newReservationRef = push(reservationsRef);
    console.log(reservationsRef);
    await set(newReservationRef, {
        userId,
        tableId,
        date,
        startTime,
        endTime,
    });
    console.log('Reservación creada:', newReservationRef.key);
};

async function getAllReservations() {
    try {
      const reservationsRef = ref(db, 'reservations');
      const snapshot = await get(reservationsRef); // Obtener todos los datos de las reservaciones
  
      if (snapshot.exists()) {
        const reservations = snapshot.val(); // Aquí tienes todas las reservaciones
        return reservations;
      } else {
        console.log("No hay reservaciones en la base de datos.");
      }
    } catch (error) {
      console.error("Error al obtener las reservaciones:", error.message);
    }
}

async function getCurrentUserData() {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
            let uid = user.uid;
            let userRef = ref(db, `users/${uid}`);
            try {
                let userData = await get(userRef);
                if (userData.exists()) {
                    resolve([uid, userData.val()]); // Resolver con los datos del usuario
                } else {
                    reject("No se encontraron datos para este usuario.");
                }
            } catch (error) {
                reject(error.message);
            }
        } else {
            reject("No hay usuario autenticado.");
            // window.location.href = "./login.html";
        }
      })
    })
    
}

function validateReservation(reservations, tableId, date, startTime, endTime) {
  let now = new Date();
  let today = now.toISOString().split("T")[0];

  let start = new Date(`${date}T${startTime}`);
  let end = new Date(`${date}T${endTime}`);

  console.log("Entra");
  if (date < today || start >= end || start <= now) {
    return false;
  }

  let reservationsForTable = Object.values(reservations).filter(res => res.tableId == tableId);

  for (let reservation of reservationsForTable) {
    let existingStart = new Date(`${reservation.date}T${reservation.startTime}`);
    let existingEnd = new Date(`${reservation.date}T${reservation.endTime}`);

    if ((start >= existingStart && start < existingEnd) || (end > existingStart && end <= existingEnd) ||
        (start <= existingStart && end >= existingEnd)) {
        
        return false;
    }
  }

  
  return true;
}

export { createUser, createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData, validateReservation };
