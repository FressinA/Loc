const express = require('express');
const app = express();
const port = 3000;

// Coordonnées de test
let location = {
    latitude: 48.8566, // Exemple: Paris
    longitude: 2.3522
};

// API pour récupérer les coordonnées
app.get('/api/location', (req, res) => {
    res.json(location);  // Retourne les coordonnées actuelles
});

// API pour mettre à jour les coordonnées (simulation de mise à jour)
app.post('/api/update-location', express.json(), (req, res) => {
    const { latitude, longitude } = req.body;
    location = { latitude, longitude }; // Mise à jour des coordonnées
    res.json({ success: true, message: 'Coordonnées mises à jour' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});