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

function validateReservation(tableId, date, time) {
  if (date == "2025-01-23" && (time >= "21:00" && time <= "23:00") ) {
    return false;
  }

  return true;
}

console.log(validateReservation(2, "2025-02-23", "22:00"));

export { createUser, createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData };
