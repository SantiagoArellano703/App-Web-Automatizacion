import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { db, auth } from "./firebaseInit.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Crear usuario
const createUser = async (user, email, name, lastname, rol) => {
  const newUserRef = ref(db, `users/${user.uid}`);
  await set(newUserRef, {
      email,
      name,
      lastname,
      rol
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
const createReservation = async (userId, tableId, date, startTime, endTime, order) => {
    const reservationsRef = ref(db, 'reservations');
    const newReservationRef = push(reservationsRef);
    console.log(reservationsRef);
    await set(newReservationRef, {
        userId,
        tableId,
        date,
        startTime,
        endTime,
        order,
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

async function getUser(uid) {
  return new Promise((resolve, reject) => {
    let userRef = ref(db, "users/" + uid);

    get(userRef).then((userData) => {
        if (userData.exists()) {
            resolve(userData.val());
        } else {
          reject("No se encontró el usuario");
        }
    });
  });
}

function validateReservation(reservations, tableId, date, startTime, endTime) {
  if (!reservations) return true;

  let now = new Date();
  let today = getLocalDateString(now);

  let start = new Date(`${date}T${startTime}`);
  let end = new Date(`${date}T${endTime}`);

  if (date < today || start >= end || start <= now) {
    console.log("TODAY");
    return false;
  }

  let reservationsForTable = Object.values(reservations).filter(res => res.tableId == tableId);

  for (let reservation of reservationsForTable) {
    let existingStart = new Date(`${reservation.date}T${reservation.startTime}`);
    let existingEnd = new Date(`${reservation.date}T${reservation.endTime}`);

    if ((start >= existingStart && start < existingEnd) || (end > existingStart && end <= existingEnd) ||
        (start <= existingStart && end >= existingEnd)) {
          console.log("HORA");
        return false;
    }
  }

  return true;
}

function logout(auth) {
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

function getLocalDateString(date) {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() es 0-indexado
  let day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}


export { createUser, createTable, createReservation, getAllReservations, getAllTables, getCurrentUserData, getUser, validateReservation, getLocalDateString, logout };
