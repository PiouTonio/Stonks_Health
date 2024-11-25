// Fonction pour charger les données évolutives (poids, taille) et les afficher dans des graphiques
async function loadEvolutionData() {
  const apiUrl = "https://example.com/api/evolution-data"; // URL fictive de l'API
  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Erreur lors du chargement des données évolutives.");
    const data = await response.json();

    renderChart(
      "weightChart",
      "Évolution du poids",
      data.weight.dates,
      data.weight.values
    );
    renderChart(
      "heightChart",
      "Évolution de la taille",
      data.height.dates,
      data.height.values
    );
  } catch (error) {
    console.error("Erreur:", error);
    alert("Impossible de charger les données évolutives.");
  }
}

// Fonction pour charger l'historique médical
async function loadMedicalHistory() {
  const apiUrl = "https://example.com/api/medical-history"; // URL fictive de l'API
  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Erreur lors du chargement de l'historique médical.");
    const history = await response.json();

    const historyDiv = document.getElementById("medicalHistory");
    historyDiv.innerHTML = "";

    history.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "data-box";
      itemDiv.innerHTML = `
                <p><strong>Date :</strong> ${item.date}</p>
                <p><strong>Type :</strong> ${item.type}</p>
                <p><strong>Description :</strong> ${item.description}</p>
            `;
      historyDiv.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("Erreur:", error);
    alert("Impossible de charger l'historique médical.");
  }
}

// Fonction pour charger les informations statiques (exemple : groupe sanguin)
async function loadStaticData() {
  const apiUrl = "https://example.com/api/static-data"; // URL fictive de l'API
  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Erreur lors du chargement des données statiques.");
    const data = await response.json();

    document.getElementById("bloodGroup").textContent = data.bloodGroup;
    document.getElementById("height").textContent = `${data.height} cm`;
    document.getElementById("weight").textContent = `${data.weight} kg`;
    document.getElementById("allergies").textContent =
      data.allergies || "Aucune";
  } catch (error) {
    console.error("Erreur:", error);
    alert("Impossible de charger les données statiques.");
  }
}

// Fonction pour afficher un graphique
function renderChart(canvasId, title, labels, data) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          borderColor: "rgba(76, 175, 80, 1)",
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: "Dates" } },
        y: { title: { display: true, text: "Valeurs" } },
      },
    },
  });
}

// Charger les données au démarrage
window.onload = () => {
  loadEvolutionData();
  loadMedicalHistory();
  loadStaticData();
};
