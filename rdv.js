// Fonction pour charger les médecins depuis la base de données (simulé)
async function fetchDoctors() {
  const apiUrl = "https://example.com/api/doctors"; // URL de l'API (à remplacer)

  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Erreur lors du chargement des médecins.");

    const doctors = await response.json();
    renderDoctors(doctors);
  } catch (error) {
    console.error("Erreur:", error);
    alert("Échec du chargement des médecins.");
  }
}

// Fonction pour afficher les médecins
function renderDoctors(doctors) {
  const searchInput = document.getElementById("searchDoctor");
  const specialtyFilter = document.getElementById("specialtyFilter");
  const doctorsList = document.getElementById("doctorsList");

  // Fonction pour filtrer les médecins
  function filterDoctors() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedSpecialty = specialtyFilter.value;

    const filteredDoctors = doctors.filter(
      (doctor) =>
        (doctor.name.toLowerCase().includes(searchQuery) ||
          searchQuery === "") &&
        (doctor.specialty === selectedSpecialty || selectedSpecialty === "")
    );

    doctorsList.innerHTML = "";
    filteredDoctors.forEach((doctor) => {
      const doctorDiv = document.createElement("div");
      doctorDiv.className = "data-box";
      doctorDiv.innerHTML = `
                <p><strong>Nom :</strong> ${doctor.name}</p>
                <p><strong>Spécialité :</strong> ${doctor.specialty}</p>
                <button onclick="selectDoctor('${doctor.id}')">Choisir</button>
            `;
      doctorsList.appendChild(doctorDiv);
    });

    if (filteredDoctors.length === 0) {
      doctorsList.innerHTML = "<p>Aucun médecin trouvé.</p>";
    }
  }

  searchInput.addEventListener("input", filterDoctors);
  specialtyFilter.addEventListener("change", filterDoctors);
  filterDoctors();
}

// Fonction appelée lorsqu'un médecin est sélectionné
function selectDoctor(doctorId) {
  alert(`Médecin sélectionné : ${doctorId}`);
  loadCalendar(doctorId); // Charger le calendrier pour ce médecin
}

// Fonction pour charger le calendrier (jours disponibles et indisponibles)
async function loadCalendar(doctorId) {
  const apiUrl = `https://example.com/api/calendar/${doctorId}`; // URL de l'API (à remplacer)
  const calendarDiv = document.getElementById("calendar");

  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Erreur lors du chargement du calendrier.");

    const calendar = await response.json();
    calendarDiv.innerHTML = "";

    // Générer le calendrier
    calendar.forEach((day) => {
      const dayDiv = document.createElement("div");
      dayDiv.className = `data-box ${
        day.available ? "available" : "unavailable"
      }`;
      dayDiv.innerHTML = `<p>${day.date}</p>`;
      if (day.available) {
        dayDiv.addEventListener("click", () => selectDay(day.date, doctorId));
      }
      calendarDiv.appendChild(dayDiv);
    });
  } catch (error) {
    console.error("Erreur:", error);
    alert("Échec du chargement du calendrier.");
  }
}

// Fonction appelée lorsqu'un jour est sélectionné
async function selectDay(date, doctorId) {
  alert(`Jour sélectionné : ${date}`);
  loadTimeSlots(date, doctorId);
}

// Fonction pour charger les créneaux horaires disponibles
async function loadTimeSlots(date, doctorId) {
  const apiUrl = `https://example.com/api/timeslots/${doctorId}/${date}`; // URL de l'API (à remplacer)
  const timeSlotsDiv = document.getElementById("timeSlots");

  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Erreur lors du chargement des créneaux horaires.");

    const timeSlots = await response.json();
    timeSlotsDiv.innerHTML = "";

    // Générer les créneaux horaires
    timeSlots.forEach((slot) => {
      const slotDiv = document.createElement("div");
      slotDiv.className = `data-box ${
        slot.available ? "available" : "unavailable"
      }`;
      slotDiv.innerHTML = `<p>${slot.time}</p>`;
      if (slot.available) {
        slotDiv.addEventListener("click", () =>
          alert(`Créneau sélectionné : ${slot.time}`)
        );
      }
      timeSlotsDiv.appendChild(slotDiv);
    });
  } catch (error) {
    console.error("Erreur:", error);
    alert("Échec du chargement des créneaux horaires.");
  }
}

// Charger les médecins au démarrage
window.onload = fetchDoctors;
