/**
 * public/js/app.js
 *
 * Este es el codigo que corre en el NAVEGADOR, no en el servidor.
 * Se encarga de: capturar eventos (clics, envio del formulario),
 * llamar al servidor con fetch(), y actualizar la pantalla con
 * lo que responde. No sabe nada de archivos JSON ni de validaciones:
 * eso lo decide el Back-End.
 */

// ---- Elementos de la tienda -------------------------------------------
const listaVideojuegos = document.getElementById('listaVideojuegos');
const panelEstadisticas = document.getElementById('panelEstadisticas');
const campoBuscar = document.getElementById('campoBuscar');
const botonBuscar = document.getElementById('botonBuscar');
const botonLimpiar = document.getElementById('botonLimpiar');
const botonOrdenar = document.getElementById('botonOrdenar');
const formularioAgregar = document.getElementById('formularioAgregar');
const listaErrores = document.getElementById('listaErrores');

// ---- Elementos de la sala de maquinas ----------------------------------
const pasosRestaurante = document.getElementById('pasosRestaurante');
const pasosTecnico = document.getElementById('pasosTecnico');
const descripcionActorRestaurante = document.getElementById('descripcionActorRestaurante');
const descripcionActorTecnico = document.getElementById('descripcionActorTecnico');
const jsonCrudo = document.getElementById('jsonCrudo');
const enlaceJson = document.getElementById('enlaceJson');
const ultimaPeticion = document.getElementById('ultimaPeticion');

let direccionOrden = 'asc';
let temporizadorTraza = null; // guarda el "siguiente paso pendiente" para poder cancelarlo

/* ============================================================
   ACTORES CLICABLES: cada personaje explica su propio rol
   ============================================================ */
const DESCRIPCIONES_RESTAURANTE = {
    jugador: 'Es quien usa la tienda: busca, agrega y compra videojuegos. Todo lo que hace, lo hace desde su mesa (la pantalla).',
    vendedor: 'Recibe el pedido del Jugador y se lo lleva a la cocina. No decide nada por su cuenta: solo coordina.',
    bodeguero: 'Tiene las llaves de la bodega: busca, ordena, valida y guarda los productos.'
};

const DESCRIPCIONES_TECNICO = {
    view: 'La interfaz que ve el usuario: HTML, CSS y el JavaScript del navegador. No sabe nada de archivos ni de reglas de negocio.',
    controller: 'Recibe la peticion HTTP, la interpreta y llama al Model. No valida datos ni arma HTML: solo coordina.',
    model: 'Contiene las reglas y los algoritmos: buscar, ordenar, validar, calcular estadisticas.',
    repository: 'Es el unico que abre y guarda data/videojuegos.json. Si el dato viviera en otro lugar, solo este archivo cambiaria.'
};

/**
 * Al hacer clic en un actor, lo marca como "seleccionado" (un contorno
 * fijo, distinto del brillo de color que usa la animacion de la traza)
 * y muestra su descripcion. Un segundo clic sobre el mismo actor
 * lo deselecciona.
 */
function activarClicsDeActores(panel, diccionario, elementoDescripcion) {
    document.querySelectorAll(`[data-panel="${panel}"] .actor`).forEach((actor) => {
        actor.addEventListener('click', () => {
            const yaEstabaSeleccionado = actor.classList.contains('seleccionado');

            document.querySelectorAll(`[data-panel="${panel}"] .actor`).forEach((el) => {
                el.classList.remove('seleccionado');
            });

            if (yaEstabaSeleccionado) {
                elementoDescripcion.classList.add('oculto');
                return;
            }

            actor.classList.add('seleccionado');
            elementoDescripcion.textContent = diccionario[actor.dataset.actor];
            elementoDescripcion.classList.remove('oculto');
        });

        // Enter y espacio hacen lo mismo que un clic, para quien navega con teclado
        actor.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                actor.click();
            }
        });
    });
}

activarClicsDeActores('restaurante', DESCRIPCIONES_RESTAURANTE, descripcionActorRestaurante);
activarClicsDeActores('tecnico', DESCRIPCIONES_TECNICO, descripcionActorTecnico);

/* ============================================================
   PESTAÑAS de la sala de maquinas
   ============================================================ */
document.querySelectorAll('.pestana').forEach((boton) => {
    boton.addEventListener('click', () => {
        document.querySelectorAll('.pestana').forEach((b) => b.classList.remove('activa'));
        document.querySelectorAll('.panel-pestana').forEach((p) => p.classList.add('oculto'));

        boton.classList.add('activa');
        const nombrePestana = boton.dataset.pestana;
        document.querySelector(`[data-panel="${nombrePestana}"]`).classList.remove('oculto');
    });
});

/* ============================================================
   RENDER: pintar lo que llego del servidor
   ============================================================ */
function pintarVideojuegos(videojuegos) {
    if (videojuegos.length === 0) {
        listaVideojuegos.innerHTML = '<li class="cargando">No se encontraron videojuegos.</li>';
        return;
    }

    listaVideojuegos.innerHTML = videojuegos
        .map(
            (juego) => `
      <li>
        <span>
          <span class="nombre-juego">${juego.nombre}</span>
          <span class="categoria-juego">${juego.categoria}</span>
        </span>
        <span class="precio-juego">$${juego.precio.toLocaleString('es-CO')}</span>
      </li>
    `
        )
        .join('');
}

function pintarEstadisticas(estadisticas) {
    if (estadisticas.cantidad === 0) {
        panelEstadisticas.innerHTML = '<span class="cargando">Sin datos todavia.</span>';
        return;
    }

    panelEstadisticas.innerHTML = `
    <div class="dato-estadistica">
      <span class="etiqueta">Total</span>
      <span class="valor">${estadisticas.cantidad}</span>
    </div>
    <div class="dato-estadistica">
      <span class="etiqueta">Promedio</span>
      <span class="valor">$${estadisticas.promedio.toLocaleString('es-CO')}</span>
    </div>
    <div class="dato-estadistica">
      <span class="etiqueta">Más caro</span>
      <span class="valor">${estadisticas.masCaro.nombre}</span>
    </div>
    <div class="dato-estadistica">
      <span class="etiqueta">Más barato</span>
      <span class="valor">${estadisticas.masBarato.nombre}</span>
    </div>
  `;
}

/* ============================================================
   TRAZA: anima la sala de maquinas paso a paso
   ============================================================ */
const MAPA_ACTOR_RESTAURANTE = {
    view: 'jugador',
    view_final: 'jugador',
    controller: 'vendedor',
    model: 'bodeguero',
    repository: 'bodeguero',
    http_salida: null,
    http_entrada: null
};

const MAPA_ACTOR_TECNICO = {
    view: 'view',
    view_final: 'view',
    controller: 'controller',
    model: 'model',
    repository: 'repository',
    http_salida: null,
    http_entrada: null
};

function iluminarActor(panel, actorActivo) {
    document.querySelectorAll(`[data-panel="${panel}"] .actor`).forEach((elemento) => {
        elemento.classList.toggle('activo', elemento.dataset.actor === actorActivo);
    });
}

/**
 * Agrega un paso nuevo al final de una lista, y marca el paso
 * anterior (si existe) como "completado" en vez de borrarlo.
 * Asi el historial completo queda visible al terminar la animacion.
 */
function agregarPasoALista(lista, texto) {
    const pasoAnterior = lista.querySelector('li.activo');
    if (pasoAnterior) {
        pasoAnterior.classList.remove('activo');
        pasoAnterior.classList.add('completado');
    }

    const nuevoPaso = document.createElement('li');
    nuevoPaso.className = 'activo';
    nuevoPaso.textContent = texto;
    lista.appendChild(nuevoPaso);

    lista.scrollTop = lista.scrollHeight;
}

function reproducirTraza(pasos) {
    // Si esta respuesta no trae traza (por ejemplo, una version del codigo
    // que todavia no la genera), no animamos nada en vez de romper la pagina.
    if (!pasos || pasos.length === 0) return;

    // Si ya habia una animacion en curso (por ejemplo, el usuario hizo
    // doble clic), la cancelamos para que no se mezclen dos historias.
    if (temporizadorTraza) {
        clearTimeout(temporizadorTraza);
        temporizadorTraza = null;
    }

    pasosRestaurante.innerHTML = '';
    pasosTecnico.innerHTML = '';

    let indice = 0;

    function siguientePaso() {
        const paso = pasos[indice];

        agregarPasoALista(pasosRestaurante, paso.restaurante);
        agregarPasoALista(pasosTecnico, paso.tecnico);
        iluminarActor('restaurante', MAPA_ACTOR_RESTAURANTE[paso.codigo]);
        iluminarActor('tecnico', MAPA_ACTOR_TECNICO[paso.codigo]);

        indice++;

        if (indice < pasos.length) {
            temporizadorTraza = setTimeout(siguientePaso, 550);
        } else {
            temporizadorTraza = null;
        }
    }

    siguientePaso();
}

/* ============================================================
   LLAMADAS AL SERVIDOR
   ============================================================ */

/**
 * Envuelve fetch() para que, ademas de traer los datos,
 * actualice la barra inferior y la pestaña de JSON crudo.
 * Asi cada llamada al servidor queda visible en dos lugares
 * ademas de la propia interfaz.
 */
async function llamarServidor(url, opciones = {}) {
    const metodo = opciones.method || 'GET';
    const respuesta = await fetch(url, opciones);
    const datos = await respuesta.json();

    ultimaPeticion.textContent = `Última petición: ${metodo} ${url} · ${respuesta.status}`;
    jsonCrudo.textContent = JSON.stringify(datos, null, 2);
    enlaceJson.href = url;

    return { datos, status: respuesta.status };
}

/**
 * Si algo falla (el servidor esta apagado, un error de red, etc.),
 * esta funcion lo muestra en pantalla en vez de dejar la interfaz
 * congelada en "Cargando...", que es dificil de diagnosticar.
 */
function mostrarErrorDeConexion(error) {
    console.error('Error al hablar con el servidor:', error);
    listaVideojuegos.innerHTML = `<li class="cargando">No se pudo conectar con el servidor. ¿Esta corriendo "node server.js"?</li>`;
    panelEstadisticas.innerHTML = '<span class="cargando">Sin conexion con el servidor.</span>';
}

async function cargarVideojuegos(textoBusqueda = '') {
    const url = textoBusqueda
        ? `/api/videojuegos?buscar=${encodeURIComponent(textoBusqueda)}`
        : '/api/videojuegos';

    try {
        const { datos } = await llamarServidor(url);
        pintarVideojuegos(datos.videojuegos);
        reproducirTraza(datos.traza);
    } catch (error) {
        mostrarErrorDeConexion(error);
    }
}

async function cargarEstadisticas() {
    try {
        const { datos } = await llamarServidor('/api/videojuegos/estadisticas');
        pintarEstadisticas(datos.estadisticas);
    } catch (error) {
        mostrarErrorDeConexion(error);
    }
}

async function ordenarVideojuegos() {
    direccionOrden = direccionOrden === 'asc' ? 'desc' : 'asc';
    botonOrdenar.textContent = direccionOrden === 'asc'
        ? 'Ordenar por precio ↓'
        : 'Ordenar por precio ↑';

    const { datos } = await llamarServidor(`/api/videojuegos/ordenar?direccion=${direccionOrden}`);
    pintarVideojuegos(datos.videojuegos);
    reproducirTraza(datos.traza);
}

async function agregarVideojuego(evento) {
    evento.preventDefault();
    listaErrores.innerHTML = '';

    const formulario = new FormData(formularioAgregar);
    const nuevoVideojuego = {
        nombre: formulario.get('nombre'),
        precio: formulario.get('precio'),
        categoria: formulario.get('categoria')
    };

    const { datos, status } = await llamarServidor('/api/videojuegos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoVideojuego)
    });

    reproducirTraza(datos.traza);

    if (status === 201) {
        formularioAgregar.reset();
        await cargarVideojuegos();
        await cargarEstadisticas();
        return;
    }

    listaErrores.innerHTML = datos.errores.map((error) => `<li>${error}</li>`).join('');
}

/* ============================================================
   EVENTOS
   ============================================================ */
botonBuscar.addEventListener('click', () => cargarVideojuegos(campoBuscar.value));
botonLimpiar.addEventListener('click', () => {
    campoBuscar.value = '';
    cargarVideojuegos();
});
campoBuscar.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') cargarVideojuegos(campoBuscar.value);
});
botonOrdenar.addEventListener('click', ordenarVideojuegos);
formularioAgregar.addEventListener('submit', agregarVideojuego);

// Carga inicial al abrir la pagina
cargarVideojuegos();
cargarEstadisticas();