/**
 * server.js — Punto de entrada de la aplicacion.
 *
 * Su unica responsabilidad es levantar el servidor y configurarlo.
 * Aqui no se busca, no se valida y no se calcula nada:
 * de eso se encargaran el Controller y el Model mas adelante.
 */

const express = require('express');
const path = require('path');

const app = express();
const PUERTO = 3000;

// Permite que el servidor entienda los datos JSON que envia el navegador.
app.use(express.json());

// Deja publicos los archivos de la carpeta /public (CSS e imagenes del front-end).
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Este middleware imprime en la terminal cada peticion que llega.
 * Es la prueba visible de que el navegador y el servidor son dos programas
 * distintos hablando entre si.
 */
app.use((peticion, respuesta, siguiente) => {
  const hora = new Date().toLocaleTimeString('es-CO');
  console.log(`[${hora}]  ${peticion.method}  ${peticion.url}`);
  siguiente();
});

// Ruta de prueba: confirma que el servidor esta vivo.
app.get('/api/estado', (peticion, respuesta) => {
  respuesta.json({
    mensaje: 'El servidor esta funcionando',
    metodo: peticion.method,
    ruta: peticion.url
  });
});

app.listen(PUERTO, () => {
  console.log('');
  console.log('  Tienda de Videojuegos MVC');
  console.log(`  Servidor escuchando en http://localhost:${PUERTO}`);
  console.log(`  Prueba: http://localhost:${PUERTO}/api/estado`);
  console.log('');
});
