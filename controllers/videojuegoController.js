/**
 * controllers/videojuegoController.js
 *
 * El Controller es el "Vendedor": recibe lo que pide el Jugador,
 * se lo lleva al Model (el "Bodeguero"), y devuelve la respuesta.
 *
 * Lo que NO hace un Controller es importante:
 * no busca en el archivo el mismo, no decide si un precio es valido,
 * no arma HTML. Solo coordina.
 *
 * Cada funcion tambien arma una "traza": una lista de pasos que explica,
 * en dos vocabularios distintos (restaurante y tecnico), que fue pasando
 * por dentro del programa. Esa traza es la que anima el panel derecho
 * de la interfaz ("la sala de maquinas"). No cambia el resultado real,
 * solo lo explica.
 */

const model = require('../models/videojuegoModel');

/**
 * GET /api/videojuegos
 * GET /api/videojuegos?buscar=mario
 */
function obtenerVideojuegos(peticion, respuesta) {
    const textoBusqueda = peticion.query.buscar;
    const hayBusqueda = Boolean(textoBusqueda);

    const videojuegos = hayBusqueda
        ? model.buscarPorNombre(textoBusqueda)
        : model.obtenerTodos();

    const traza = hayBusqueda
        ? [
            { codigo: 'view', restaurante: `Pediste buscar "${textoBusqueda}"`, tecnico: `Pediste buscar "${textoBusqueda}"` },
            { codigo: 'http_salida', restaurante: 'Tu pedido sale hacia la cocina', tecnico: `GET /api/videojuegos?buscar=${textoBusqueda}` },
            { codigo: 'controller', restaurante: 'El Vendedor recibe tu pedido', tecnico: 'El Controller recibe la peticion y llama al Model' },
            { codigo: 'model', restaurante: 'El Bodeguero busca en los estantes, uno por uno', tecnico: 'El Model ejecuta busqueda lineal sobre el arreglo' },
            { codigo: 'repository', restaurante: 'El Bodeguero abre la bodega para revisar', tecnico: 'El Repository lee data/videojuegos.json' },
            { codigo: 'http_entrada', restaurante: 'El resultado vuelve a tu mesa', tecnico: `Respuesta 200 OK con ${videojuegos.length} resultado(s)` },
            { codigo: 'view_final', restaurante: 'Ves el resultado en tu mesa', tecnico: 'La Vista pinta el resultado en pantalla' }
        ]
        : [
            { codigo: 'view', restaurante: 'Entraste a la tienda', tecnico: 'Se cargo la pagina principal' },
            { codigo: 'http_salida', restaurante: 'Pides ver el menu completo', tecnico: 'GET /api/videojuegos' },
            { codigo: 'controller', restaurante: 'El Vendedor recibe tu pedido', tecnico: 'El Controller recibe la peticion y llama al Model' },
            { codigo: 'model', restaurante: 'El Bodeguero revisa todo el inventario', tecnico: 'El Model pide todos los registros' },
            { codigo: 'repository', restaurante: 'El Bodeguero abre la bodega completa', tecnico: 'El Repository lee data/videojuegos.json' },
            { codigo: 'http_entrada', restaurante: 'El menu completo llega a tu mesa', tecnico: `Respuesta 200 OK con ${videojuegos.length} videojuego(s)` },
            { codigo: 'view_final', restaurante: 'Ves el menu completo', tecnico: 'La Vista pinta la lista en pantalla' }
        ];

    respuesta.json({
        exito: true,
        cantidad: videojuegos.length,
        videojuegos,
        traza
    });
}

/**
 * GET /api/videojuegos/ordenar?direccion=asc|desc
 */
function ordenarVideojuegos(peticion, respuesta) {
    const direccion = peticion.query.direccion === 'desc' ? 'desc' : 'asc';
    const videojuegos = model.ordenarPorPrecio(direccion);
    const textoDireccion = direccion === 'desc' ? 'de mayor a menor precio' : 'de menor a mayor precio';

    const traza = [
        { codigo: 'view', restaurante: `Pediste el menu ${textoDireccion}`, tecnico: `Pediste ordenar ${textoDireccion}` },
        { codigo: 'http_salida', restaurante: 'El pedido sale hacia la cocina', tecnico: `GET /api/videojuegos/ordenar?direccion=${direccion}` },
        { codigo: 'controller', restaurante: 'El Vendedor recibe el pedido', tecnico: 'El Controller recibe la peticion' },
        { codigo: 'model', restaurante: 'El Bodeguero reordena los productos en el estante, comparando de a dos', tecnico: 'El Model ejecuta el algoritmo de ordenamiento burbuja' },
        { codigo: 'http_entrada', restaurante: 'El menu ordenado llega a tu mesa', tecnico: 'Respuesta 200 OK con la lista ordenada' },
        { codigo: 'view_final', restaurante: 'Ves el menu ya ordenado', tecnico: 'La Vista pinta la lista ordenada' }
    ];

    respuesta.json({ exito: true, direccion, videojuegos, traza });
}

/**
 * GET /api/videojuegos/estadisticas
 */
function obtenerEstadisticas(peticion, respuesta) {
    const estadisticas = model.calcularEstadisticas();

    const traza = [
        { codigo: 'view', restaurante: 'Pediste el resumen de la tienda', tecnico: 'Pediste las estadisticas' },
        { codigo: 'http_salida', restaurante: 'El pedido sale hacia la cocina', tecnico: 'GET /api/videojuegos/estadisticas' },
        { codigo: 'controller', restaurante: 'El Vendedor recibe el pedido', tecnico: 'El Controller recibe la peticion' },
        { codigo: 'model', restaurante: 'El Bodeguero recorre todo el inventario sumando y comparando precios', tecnico: 'El Model recorre el arreglo acumulando total, maximo y minimo' },
        { codigo: 'http_entrada', restaurante: 'El resumen llega a tu mesa', tecnico: 'Respuesta 200 OK con las estadisticas' },
        { codigo: 'view_final', restaurante: 'Ves el resumen en pantalla', tecnico: 'La Vista pinta el resumen' }
    ];

    respuesta.json({ exito: true, estadisticas, traza });
}

/**
 * POST /api/videojuegos
 * Body esperado: { nombre, precio, categoria }
 */
function crearVideojuego(peticion, respuesta) {
    const resultado = model.crear(peticion.body);
    const nombreEnviado = peticion.body.nombre || '(sin nombre)';

    if (!resultado.exito) {
        const traza = [
            { codigo: 'view', restaurante: `Enviaste el formulario para agregar "${nombreEnviado}"`, tecnico: `Enviaste el formulario para agregar "${nombreEnviado}"` },
            { codigo: 'http_salida', restaurante: 'El pedido nuevo sale hacia la cocina', tecnico: 'POST /api/videojuegos' },
            { codigo: 'controller', restaurante: 'El Vendedor recibe el pedido y se lo lleva al Bodeguero', tecnico: 'El Controller recibe los datos y llama al Model' },
            { codigo: 'model', restaurante: 'El Bodeguero revisa el pedido y encuentra algo mal', tecnico: 'El Model valida los datos y encuentra errores' },
            { codigo: 'http_entrada', restaurante: 'La cocina devuelve el pedido con una nota de error', tecnico: 'Respuesta 400: peticion invalida' },
            { codigo: 'view_final', restaurante: 'Ves el mensaje de error', tecnico: 'La Vista muestra los errores de validacion' }
        ];

        return respuesta.status(400).json({ exito: false, errores: resultado.errores, traza });
    }

    const traza = [
        { codigo: 'view', restaurante: `Enviaste el formulario para agregar "${resultado.videojuego.nombre}"`, tecnico: `Enviaste el formulario para agregar "${resultado.videojuego.nombre}"` },
        { codigo: 'http_salida', restaurante: 'El pedido nuevo sale hacia la cocina', tecnico: 'POST /api/videojuegos' },
        { codigo: 'controller', restaurante: 'El Vendedor recibe el pedido y se lo lleva al Bodeguero', tecnico: 'El Controller recibe los datos y llama al Model' },
        { codigo: 'model', restaurante: 'El Bodeguero revisa el pedido: todo esta en orden', tecnico: 'El Model valida los datos: todo correcto' },
        { codigo: 'repository', restaurante: 'El Bodeguero guarda el producto nuevo en la bodega', tecnico: 'El Repository escribe el nuevo registro en data/videojuegos.json' },
        { codigo: 'http_entrada', restaurante: 'La cocina confirma que el pedido quedo listo', tecnico: 'Respuesta 201: creado' },
        { codigo: 'view_final', restaurante: 'Ves el nuevo videojuego en el menu', tecnico: 'La Vista actualiza la lista' }
    ];

    respuesta.status(201).json({ exito: true, videojuego: resultado.videojuego, traza });
}

module.exports = {
    obtenerVideojuegos,
    ordenarVideojuegos,
    obtenerEstadisticas,
    crearVideojuego
};