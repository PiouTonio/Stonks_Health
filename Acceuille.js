// Fonction pour charger les données depuis la base de données (simulation pour l'instant)
async function fetchHealthData() {
  // Appel fictif à une API - à remplacer par l'URL de votre API réelle
  const apiUrl = "https://example.com/api/health-data"; // URL de l'API (à remplacer)

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Erreur lors du chargement des données.");

    const healthData = await response.json();

    // Mise à jour des valeurs dans les encadrés (lecture seule)
    document.getElementById("weight").textContent = healthData.weight + " kg";
    document.getElementById("bloodPressure").textContent =
      healthData.bloodPressure;
    document.getElementById("heartRate").textContent =
      healthData.heartRate + " bpm";
    document.getElementById("bloodSugar").textContent =
      healthData.bloodSugar + " mg/dL";
    document.getElementById("cholesterol").textContent =
      healthData.cholesterol + " mg/dL";
    document.getElementById("temperature").textContent =
      healthData.temperature + " °C";
  } catch (error) {
    console.error("Erreur:", error);
    alert("Échec du chargement des données de santé.");
  }
}

// Appel de la fonction pour charger les données au démarrage
window.onload = fetchHealthData;
