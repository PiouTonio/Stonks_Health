// Fonction pour charger les informations utilisateur
async function loadUserData() {
  const apiUrl = "https://example.com/api/user-data"; // URL fictive de l'API

  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error("Erreur lors du chargement des données utilisateur.");

    const userData = await response.json();

    // Remplir les champs avec les données de l'utilisateur
    document.getElementById("userLastName").textContent = userData.lastName;
    document.getElementById("userFirstName").textContent = userData.firstName;
    document.getElementById("userBirthDate").textContent = userData.birthDate;
    document.getElementById("userSocialNumber").textContent =
      userData.socialNumber;
  } catch (error) {
    console.error("Erreur:", error);
    alert("Impossible de charger les informations personnelles.");
  }
}

// Fonction pour changer le mot de passe
async function changePassword(event) {
  event.preventDefault(); // Empêche le rechargement de la page

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Vérification des mots de passe
  if (newPassword !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  const apiUrl = "https://example.com/api/change-password"; // URL fictive de l'API

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok)
      throw new Error("Erreur lors du changement de mot de passe.");

    alert("Mot de passe mis à jour avec succès !");
    document.getElementById("passwordChangeForm").reset();
  } catch (error) {
    console.error("Erreur:", error);
    alert("Impossible de mettre à jour le mot de passe.");
  }
}

// Charger les informations utilisateur au démarrage
window.onload = () => {
  loadUserData();

  // Associer le formulaire à la fonction de changement de mot de passe
  const passwordChangeForm = document.getElementById("passwordChangeForm");
  passwordChangeForm.addEventListener("submit", changePassword);
};
