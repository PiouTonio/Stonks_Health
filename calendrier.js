document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const appointmentDetailsEl = document.getElementById("appointmentDetails");

  // Charger les rendez-vous depuis l'API
  async function fetchAppointments() {
    const apiUrl = "https://example.com/api/appointments"; // URL fictive de l'API

    try {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error("Erreur lors du chargement des rendez-vous.");

      const appointments = await response.json();
      renderCalendar(appointments);
      renderAppointmentList(appointments);
    } catch (error) {
      console.error("Erreur:", error);
      appointmentDetailsEl.innerHTML = `<p>Impossible de charger les rendez-vous.</p>`;
    }
  }

  // Afficher le calendrier
  function renderCalendar(appointments) {
    const events = appointments.map((app) => ({
      title: app.reason,
      start: app.date + "T" + app.time,
      extendedProps: { doctor: app.doctor },
    }));

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "fr",
      events: events,
      eventClick: function (info) {
        alert(
          `Rendez-vous : ${info.event.title}\nMédecin : ${info.event.extendedProps.doctor}`
        );
      },
    });

    calendar.render();
  }

  // Afficher la liste des rendez-vous
  function renderAppointmentList(appointments) {
    appointmentDetailsEl.innerHTML = ""; // Réinitialiser la liste

    appointments.forEach((app) => {
      const appointmentDiv = document.createElement("div");
      appointmentDiv.className = "data-box";
      appointmentDiv.innerHTML = `
                <p><strong>Date :</strong> ${app.date}</p>
                <p><strong>Heure :</strong> ${app.time}</p>
                <p><strong>Médecin :</strong> ${app.doctor}</p>
                <p><strong>Motif :</strong> ${app.reason}</p>
            `;
      appointmentDetailsEl.appendChild(appointmentDiv);
    });
  }

  // Charger les rendez-vous au démarrage
  fetchAppointments();
});
