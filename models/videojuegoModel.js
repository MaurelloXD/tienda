/**
 * models/videojuegoModel.js
 *
 * El Model se encarga de los datos y de las reglas relacionadas con ellos:
 * buscar, ordenar, crear, calcular estadisticas. Nunca recibe una peticion
 * HTTP directamente y nunca arma HTML: eso es trabajo del Controller y la View.
 *
 * Para leer o guardar, el Model no toca el archivo el mismo: se lo pide
 * al Repository (repositories/videojuegoRepository.js).
 */

const repositorio = require('../repositories/videojuegoRepository');

/**
 * Devuelve todos los videojuegos tal como estan guardados.
 */
function obtenerTodos() {
    return repositorio.leerTodos();
}

/**
 * Algoritmo de busqueda lineal: recorre la lista uno por uno
 * comparando el nombre, sin importar mayusculas o minusculas.
 */
function buscarPorNombre(nombreBuscado) {
    const videojuegos = repositorio.leerTodos();
    const texto = nombreBuscado.trim().toLowerCase();

    return videojuegos.filter((juego) =>
        juego.nombre.toLowerCase().includes(texto)
    );
}

/**
 * Algoritmo de ordenamiento: burbuja, para poder explicarlo paso a paso.
 * direccion puede ser 'asc' (por defecto) o 'desc'.
 */
function ordenarPorPrecio(direccion = 'asc') {
    const videojuegos = repositorio.leerTodos();
    const lista = [...videojuegos]; // copia, para no alterar el original

    for (let i = 0; i < lista.length - 1; i++) {
        let huboIntercambio = false;

        for (let j = 0; j < lista.length - 1 - i; j++) {
            const debeIntercambiar =
                direccion === 'desc'
                    ? lista[j].precio < lista[j + 1].precio
                    : lista[j].precio > lista[j + 1].precio;

            if (debeIntercambiar) {
                const temporal = lista[j];
                lista[j] = lista[j + 1];
                lista[j + 1] = temporal;
                huboIntercambio = true;
            }
        }

        // Optimizacion: si en una pasada no hubo intercambios, ya esta ordenada.
        if (!huboIntercambio) break;
    }

    return lista;
}

/**
 * Algoritmo de validacion: revisa cada regla por separado y devuelve
 * la lista de errores encontrados (vacia si todo esta bien).
 */
function validarVideojuego(datos) {
    const errores = [];

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

    return errores;
}

/**
 * Crea un videojuego nuevo despues de validarlo.
 * Devuelve { exito, errores, videojuego }.
 */
function crear(datos) {
    const errores = validarVideojuego(datos);
    if (errores.length > 0) {
        return { exito: false, errores, videojuego: null };
    }

    const videojuegos = repositorio.leerTodos();

    const nuevoId =
        videojuegos.length > 0
            ? Math.max(...videojuegos.map((j) => j.id)) + 1
            : 1;

    const nuevoVideojuego = {
        id: nuevoId,
        nombre: datos.nombre.trim(),
        precio: Number(datos.precio),
        categoria: datos.categoria.trim()
    };

    videojuegos.push(nuevoVideojuego);
    repositorio.guardarTodos(videojuegos);

    return { exito: true, errores: [], videojuego: nuevoVideojuego };
}

/**
 * Algoritmo de procesamiento y agregacion: recorre la lista una sola vez
 * acumulando total, y va comparando para encontrar el mas caro y el mas barato.
 */
function calcularEstadisticas() {
    const videojuegos = repositorio.leerTodos();

    if (videojuegos.length === 0) {
        return { cantidad: 0, promedio: 0, masCaro: null, masBarato: null };
    }

    let sumaPrecios = 0;
    let masCaro = videojuegos[0];
    let masBarato = videojuegos[0];

    for (const juego of videojuegos) {
        sumaPrecios += juego.precio;
        if (juego.precio > masCaro.precio) masCaro = juego;
        if (juego.precio < masBarato.precio) masBarato = juego;
    }

    return {
        cantidad: videojuegos.length,
        promedio: Math.round(sumaPrecios / videojuegos.length),
        masCaro,
        masBarato
    };
}

module.exports = {
    obtenerTodos,
    buscarPorNombre,
    ordenarPorPrecio,
    validarVideojuego,
    crear,
    calcularEstadisticas
};