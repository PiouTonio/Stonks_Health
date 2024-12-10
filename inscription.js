<<<<<<< Updated upstream
document.addEventListener("DOMContentLoaded", () => {
    const radioOui = document.querySelector('input[name="medecin-traitant"][value="oui"]');
    const radioNon = document.querySelector('input[name="medecin-traitant"][value="non"]');
    const medecinNomDiv = document.querySelector(".medecin-nom");

    radioOui.addEventListener("change", () => {
        medecinNomDiv.classList.remove("hidden");
    });

    radioNon.addEventListener("change", () => {
        medecinNomDiv.classList.add("hidden");
    });

    const form = document.getElementById("registration-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nom = form.nom.value.trim();
        const prenom = form.prenom.value.trim();
        const email = form.email.value.trim();
        const telephone = form.telephone.value.trim();
        const securiteSociale = form["securite-sociale"].value.trim();
        const genre = form.genre.value;
        const medecinTraitant = form["medecin-traitant"].value;
        const nomMedecin = form["nom-medecin"].value.trim();

        if (nom && prenom && email && telephone && securiteSociale && genre) {
            console.log("Formulaire validé !");
            console.log({ nom, prenom, email, telephone, securiteSociale, genre, medecinTraitant, nomMedecin });
            alert("Votre compte a été créé avec succès !");
            form.reset();
        } else {
            alert("Veuillez remplir tous les champs correctement !");
        }
    });
});
=======
document.addEventListener("DOMContentLoaded", () => {
    const radioOui = document.querySelector('input[name="medecin-traitant"][value="oui"]');
    const radioNon = document.querySelector('input[name="medecin-traitant"][value="non"]');
    const medecinNomDiv = document.querySelector(".medecin-nom");

    radioOui.addEventListener("change", () => {
        medecinNomDiv.classList.remove("hidden");
    });

    radioNon.addEventListener("change", () => {
        medecinNomDiv.classList.add("hidden");
    });

    const form = document.getElementById("registration-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nom = form.nom.value.trim();
        const prenom = form.prenom.value.trim();
        const email = form.email.value.trim();
        const telephone = form.telephone.value.trim();
        const securiteSociale = form["securite-sociale"].value.trim();
        const genre = form.genre.value;
        const medecinTraitant = form["medecin-traitant"].value;
        const nomMedecin = form["nom-medecin"].value.trim();

        if (nom && prenom && email && telephone && securiteSociale && genre) {
            console.log("Formulaire validé !");
            console.log({ nom, prenom, email, telephone, securiteSociale, genre, medecinTraitant, nomMedecin });
            alert("Votre compte a été créé avec succès !");
            form.reset();
        } else {
            alert("Veuillez remplir tous les champs correctement !");
        }
    });
});
>>>>>>> Stashed changes
