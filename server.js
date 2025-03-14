const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// Connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Remplace par ton utilisateur MySQL
    password: '', // Remplace par ton mot de passe MySQL
    database: 'LoueurVelo' // Modifié pour utiliser la nouvelle base de données
});

// Vérifier la connexion
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connecté à la base de données MySQL');
    }
});

// Servir le fichier HTML pour la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API pour récupérer les coordonnées depuis la base de données
app.get('/api/location', (req, res) => {
    db.query('SELECT latitude, longitude FROM bike_locations ORDER BY timestamp DESC LIMIT 1', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des coordonnées:', err);
            res.status(500).json({ error: 'Erreur de la base de données' });
        } else {
            if (results.length > 0) {
                res.json(results[0]); // Renvoyer la dernière position
            } else {
                res.json({ latitude: 0, longitude: 0 }); // Si aucune donnée trouvée
            }
        }
    });
});

// API pour mettre à jour les coordonnées dans la base de données
app.post('/api/update-location', express.json(), (req, res) => {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Les coordonnées sont nécessaires' });
    }

    // Insérer les nouvelles coordonnées dans la base de données
    const query = 'INSERT INTO bike_locations (latitude, longitude) VALUES (?, ?)';
    db.query(query, [latitude, longitude], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'insertion des coordonnées:', err);
            return res.status(500).json({ error: 'Erreur de la base de données' });
        }
        res.json({ success: true, message: 'Coordonnées mises à jour', id: results.insertId });
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});