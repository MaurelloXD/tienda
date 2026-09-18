/**
 * controllers/videojuegoController.js
 *
 * ============================================================
 * ANTES de aplicar el principio de Responsabilidad Unica (SRP).
 * ============================================================
 *
 * Este archivo mezcla, en un mismo lugar:
 *   1. El acceso al archivo de datos (leer y escribir el JSON).
 *   2. Las reglas de negocio (validar, buscar, ordenar, calcular).
 *   3. La coordinacion de la peticion HTTP (lo que si es trabajo
 *      de un Controller).
 *
 * Tiene, por lo menos, TRES razones distintas para cambiar:
 * si cambia el formato del archivo de datos, si cambia una regla
 * de negocio, o si cambia el formato de la respuesta HTTP.
 * Eso es exactamente lo que el Principio de Responsabilidad Unica
 * dice que hay que evitar: "una clase o modulo deberia tener una
 * sola razon para cambiar".
 *
 * Compara este archivo con la version en la rama "main": alli el
 * mismo trabajo esta repartido en tres archivos (Controller, Model
 * y Repository), cada uno con una sola responsabilidad.
 */

const fs = require('fs');
const path = require('path');

const RUTA_ARCHIVO = path.join(__dirname, '..', 'data', 'videojuegos.json');

function obtenerVideojuegos(peticion, respuesta) {
    // --- Acceso a datos, mezclado directamente aqui ---
    const contenido = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
    const todos = JSON.parse(contenido);

    // --- Regla de negocio (busqueda), mezclada directamente aqui ---
    const textoBusqueda = peticion.query.buscar;
    let videojuegos = todos;

    if (textoBusqueda) {
        const texto = textoBusqueda.trim().toLowerCase();
        videojuegos = todos.filter((juego) => juego.nombre.toLowerCase().includes(texto));
    }

    // --- Respuesta HTTP ---
    respuesta.json({ exito: true, cantidad: videojuegos.length, videojuegos });
}

function ordenarVideojuegos(peticion, respuesta) {
    const contenido = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
    const todos = JSON.parse(contenido);
    const direccion = peticion.query.direccion === 'desc' ? 'desc' : 'asc';

    // --- Algoritmo de ordenamiento (burbuja), mezclado directamente aqui ---
    const lista = [...todos];
    for (let i = 0; i < lista.length - 1; i++) {
        for (let j = 0; j < lista.length - 1 - i; j++) {
            const debeIntercambiar =
                direccion === 'desc'
                    ? lista[j].precio < lista[j + 1].precio
                    : lista[j].precio > lista[j + 1].precio;

            if (debeIntercambiar) {
                const temporal = lista[j];
                lista[j] = lista[j + 1];
                lista[j + 1] = temporal;
            }
        }
    }

    respuesta.json({ exito: true, direccion, videojuegos: lista });
}

function obtenerEstadisticas(peticion, respuesta) {
    const contenido = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
    const videojuegos = JSON.parse(contenido);

    // --- Algoritmo de agregacion, mezclado directamente aqui ---
    let sumaPrecios = 0;
    let masCaro = videojuegos[0];
    let masBarato = videojuegos[0];

    for (const juego of videojuegos) {
        sumaPrecios += juego.precio;
        if (juego.precio > masCaro.precio) masCaro = juego;
        if (juego.precio < masBarato.precio) masBarato = juego;
    }

    respuesta.json({
        exito: true,
        estadisticas: {
            cantidad: videojuegos.length,
            promedio: Math.round(sumaPrecios / videojuegos.length),
            masCaro,
            masBarato
        }
    });
}

function crearVideojuego(peticion, respuesta) {
    const datos = peticion.body;
    const errores = [];

    // --- Validacion, mezclada directamente aqui ---
    if (!datos.nombre || datos.nombre.trim() === '') {
        errores.push('El nombre no puede estar vacio.');
    }
    const precio = Number(datos.precio);
    if (Number.isNaN(precio) || precio <= 0) {
        errores.push('El precio debe ser un numero mayor que cero.');
    }
    if (!datos.categoria || datos.categoria.trim() === '') {
        errores.push('La categoria no puede estar vacia.');
    }

    if (errores.length > 0) {
        return respuesta.status(400).json({ exito: false, errores });
    }

    // --- Acceso a datos otra vez, mezclado directamente aqui ---
    const contenido = fs.readFileSync(RUTA_ARCHIVO, 'utf-8');
    const videojuegos = JSON.parse(contenido);
    const nuevoId = videojuegos.length > 0 ? Math.max(...videojuegos.map((j) => j.id)) + 1 : 1;

    const nuevoVideojuego = {
        id: nuevoId,
        nombre: datos.nombre.trim(),
        precio,
        categoria: datos.categoria.trim()
    };

    videojuegos.push(nuevoVideojuego);
    fs.writeFileSync(RUTA_ARCHIVO, JSON.stringify(videojuegos, null, 2), 'utf-8');

    respuesta.status(201).json({ exito: true, videojuego: nuevoVideojuego });
}

module.exports = {
    obtenerVideojuegos,
    ordenarVideojuegos,
    obtenerEstadisticas,
    crearVideojuego
};