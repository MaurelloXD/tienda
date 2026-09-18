/**
 * repositories/videojuegoRepository.js
 *
 * El Repository es el unico archivo que sabe que los datos viven
 * en un archivo JSON. Si mañana cambiaramos a una base de datos,
 * solo este archivo tendria que cambiar: el Model y el Controller
 * seguirian llamando a las mismas funciones sin enterarse del cambio.
 */

const fs = require('fs');
const path = require('path');

const RUTA_ARCHIVO = path.join(__dirname, '..', 'data', 'videojuegos.json');

/**
 * Lee el archivo completo y lo convierte de texto JSON a un arreglo
 * de objetos JavaScript.
 */
function leerTodos() {
    const contenido = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
    return JSON.parse(contenido);
}

/**
 * Recibe un arreglo de videojuegos y lo guarda en el archivo,
 * convirtiendolo de objetos JavaScript de vuelta a texto JSON.
 */
function guardarTodos(videojuegos) {
    const contenido = JSON.stringify(videojuegos, null, 2);
    fs.writeFileSync(RUTA_ARCHIVO, contenido, 'utf-8');
}

module.exports = { leerTodos, guardarTodos };