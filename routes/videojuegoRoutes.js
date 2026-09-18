/**
 * routes/videojuegoRoutes.js
 *
 * Este archivo no hace trabajo el mismo: solo dice
 * "cuando llegue esta URL con este metodo, que la atienda esta funcion".
 * Es el mapa de la tienda, no la tienda.
 */

const express = require('express');
const controller = require('../controllers/videojuegoController');

const router = express.Router();

// El orden importa: rutas mas especificas antes que las genericas con /:id
router.get('/videojuegos/ordenar', controller.ordenarVideojuegos);
router.get('/videojuegos/estadisticas', controller.obtenerEstadisticas);
router.get('/videojuegos', controller.obtenerVideojuegos);
router.post('/videojuegos', controller.crearVideojuego);

module.exports = router;