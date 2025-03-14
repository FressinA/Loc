let map;
let marker;
let route;
let lastLocation = null;
let lastTime = Date.now();
let userMovedMap = false;
let autoFollow = true;

const MOVEMENT_THRESHOLD = 100; // Distance en mètres pour alerte
const bikeIcon = L.icon({
    iconUrl: 'bike.png', // Remplace par ton image
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

function initMap() {
    const location = [52.3702, 4.8952]; // Position par défaut (Amsterdam)
    map = L.map('map').setView(location, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    marker = L.marker(location, { icon: bikeIcon }).addTo(map)
        .bindPopup('Vélo')
        .openPopup();

    route = L.polyline([], { color: 'blue' }).addTo(map);

    // Détecter si l'utilisateur bouge la carte
    map.on('dragstart', () => {
        userMovedMap = true;
    });

    // Ajout du bouton de suivi
    const button = document.createElement("button");
    button.id = "toggleFollow";
    button.textContent = "Suivi: Activé";
    button.style.position = "absolute";
    button.style.top = "10px";
    button.style.left = "10px";
    button.style.zIndex = "1000";
    button.onclick = toggleFollow;
    document.body.appendChild(button);

    // Mettre à jour la position toutes les 5 secondes
    setInterval(updateLocation, 5000);
}

function toggleFollow() {
    autoFollow = !autoFollow;
    document.getElementById('toggleFollow').textContent = autoFollow ? "Suivi: Activé" : "Suivi: Désactivé";
}

function calculateDistance(coord1, coord2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const lat1 = coord1[0] * Math.PI / 180;
    const lat2 = coord2[0] * Math.PI / 180;
    const deltaLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const deltaLon = (coord2[1] - coord1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}

async function updateLocation() {
    try {
        const response = await fetch('/api/location');
        if (!response.ok) throw new Error("Réponse invalide du serveur");

        const data = await response.json();
        if (!data.latitude || !data.longitude) throw new Error("Données invalides");

        const newLocation = [data.latitude, data.longitude];
        const currentTime = Date.now();
        const timeDiff = (currentTime - lastTime) / 1000; // Temps en secondes

        if (lastLocation) {
            const distance = calculateDistance(lastLocation, newLocation);
            const speed = distance / timeDiff; // m/s
            console.log(`Vitesse actuelle : ${(speed * 3.6).toFixed(2)} km/h`); // Convertie en km/h

            if (distance > MOVEMENT_THRESHOLD) {
                alert("Alerte ! Mouvement suspect détecté !");
            }
        }

        lastTime = currentTime;
        lastLocation = newLocation;

        marker.setLatLng(newLocation);
        route.addLatLng(newLocation);

        if (autoFollow) {
            map.panTo(newLocation);
        }

        await saveLocationToDatabase(data.latitude, data.longitude);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la localisation:", error);
    }
}

async function saveLocationToDatabase(latitude, longitude) {
    try {
        const response = await fetch('/api/save-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
        });
        if (!response.ok) {
            throw new Error("Erreur lors de l'enregistrement de la localisation");
        }
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de la localisation:", error);
    }
}

// Initialiser la carte
initMap();