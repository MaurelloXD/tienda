# Tienda de Videojuegos MVC

Una tienda de videojuegos que funciona, construida para poder abrirla por dentro.

La mitad izquierda de la pantalla es la tienda. La mitad derecha muestra lo que
normalmente nadie ve: la peticion viajando del navegador al servidor, pasando por
el Controller, por el Model, y volviendo convertida en respuesta.

## Como ejecutarlo

Necesitas tener [Node.js](https://nodejs.org) instalado.

```bash
git clone <URL-DEL-REPOSITORIO>
cd tienda-videojuegos-mvc
npm install
node server.js
```

Abre `http://localhost:3000` en el navegador.

Para comprobar que el servidor responde antes de que exista la interfaz:
`http://localhost:3000/api/estado`

## Tecnologias

HTML, CSS y JavaScript en el navegador. Node.js y Express en el servidor.
Los datos viven en un archivo JSON, sin base de datos.

## Estructura

```
controllers/   reciben la peticion y coordinan
models/        trabajan con los datos y las reglas
repositories/  unico punto de acceso al archivo de datos
routes/        deciden que controlador atiende cada URL
views/         la interfaz que ve el usuario
public/        CSS y JavaScript del navegador
data/          videojuegos.json
server.js      levanta el servidor
```

## Estado

En construccion por fases. Este repositorio crece commit a commit a proposito:
el historial es parte del material de la presentacion.

- [x] Fase 1 — Preparacion del proyecto
- [x] Fase 2 — Estructura de carpetas MVC
- [x] Fase 3 — Servidor Express funcionando
- [ ] Fase 4 — Datos y Model
- [ ] Fase 5 — Rutas y Controller
- [ ] Fase 6 — Interfaz
