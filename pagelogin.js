// Sélection des éléments du DOM
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");
const registerHeader = document.getElementById("register-header");

// Affichage du formulaire d'inscription
showRegisterLink.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    registerHeader.style.display = "block";
});

// Affichage du formulaire de connexion
showLoginLink.addEventListener("click", () => {
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    registerHeader.style.display = "none";
});

// Fonction pour valider l'email
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}

// Fonction pour valider le mot de passe (min 8 caractères, lettres et chiffres)
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}

// Fonction pour valider le mot de passe de confirmation
function validateConfirmPassword(password, confirmPassword) {
    return password === confirmPassword;
}

// Gestion de l'inscription
registerBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const regEmail = document.getElementById("reg-email").value;
    const regPassword = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Validation de l'email
    if (!validateEmail(regEmail)) {
        alert("Veuillez entrer un email valide.");
        return;
    }

    // Validation des mots de passe
    if (!validatePassword(regPassword)) {
        alert("Le mot de passe doit contenir au moins 8 caractères, incluant des lettres et des chiffres.");
        return;
    }

    // Validation du mot de passe de confirmation
    if (!validateConfirmPassword(regPassword, confirmPassword)) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    // Simuler l'enregistrement (cela doit être fait dans un backend réel)
    console.log("Utilisateur inscrit :", regEmail);
    alert("Inscription réussie !");
    registerForm.style.display = "none";
    loginForm.style.display = "block";
});

// Fonction pour valider la connexion (vérifier si l'email et le mot de passe sont remplis)
loginBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Validation de l'email
    if (!validateEmail(email)) {
        alert("Veuillez entrer un email valide.");
        return;
    }

    // Vérifier que le mot de passe n'est pas vide
    if (password.trim() === "") {
        alert("Veuillez entrer un mot de passe.");
        return;
    }

    // Simuler la connexion (cela doit être fait dans un backend réel)
    console.log("Utilisateur connecté :", email);
    alert("Connexion réussie !");
});
