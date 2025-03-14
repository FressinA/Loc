let map;
let marker;

function initMap() {
    const location = [48.8566, 2.3522]; // Coordonnées initiales (ex: Paris)
    map = L.map('map').setView(location, 15); // Initialisation de la carte à ces coordonnées

    // Ajouter les tuiles de la carte (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Ajouter un marqueur initial
    marker = L.marker(location).addTo(map)
        .bindPopup('Vélo')
        .openPopup();

    // Mise à jour de la position toutes les 5 secondes
    setInterval(updateLocation, 5000);
}

async function updateLocation() {
    try {
        const response = await fetch('/api/location'); // Récupérer les coordonnées depuis l'API
        const data = await response.json();
        
        if (!data.latitude || !data.longitude) {
            throw new Error('Coordonnées invalides');
        }

        const newLocation = [data.latitude, data.longitude];

        // Mettre à jour la position du marqueur
        marker.setLatLng(newLocation);

        // Déplacer la carte vers la nouvelle position
        map.panTo(newLocation);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la localisation:", error);
    }
}

// Initialiser la carte
initMap();