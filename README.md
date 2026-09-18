# Tienda de Videojuegos MVC

Una tienda de videojuegos que funciona, construida para poder abrirla por dentro.

La mitad izquierda de la pantalla es la tienda. La mitad derecha —la "sala de
maquinas"— muestra lo que normalmente nadie ve: la peticion viajando del
navegador al servidor, pasando por el Controller, por el Model, por el
Repository, y volviendo convertida en respuesta. Cada paso se explica dos
veces: como una analogia de restaurante (Jugador, Vendedor, Bodeguero) y en
vocabulario tecnico (View, Controller, Model, Repository), sincronizadas
paso a paso.

## Como ejecutarlo

Necesitas tener [Node.js](https://nodejs.org) instalado.

```bash
git clone https://github.com/MaurelloXD/tienda.git
cd tienda
npm install
node server.js
```

Abre `http://localhost:3000` en el navegador.

## Tecnologias

HTML, CSS y JavaScript en el navegador. Node.js y Express en el servidor.
Los datos viven en un archivo JSON, sin base de datos.

## Estructura

```
controllers/   reciben la peticion y coordinan
models/        trabajan con los datos y las reglas (algoritmos)
repositories/  unico punto de acceso al archivo de datos
routes/        deciden que controlador atiende cada URL
views/         la interfaz que ve el usuario
public/        CSS y JavaScript del navegador
data/          videojuegos.json
server.js      levanta el servidor
```

## El historial como material de presentacion

Este repositorio crece commit a commit a proposito, con tags que marcan cada
etapa. Se puede "viajar en el tiempo" para mostrar como crecio el proyecto:

```bash
git checkout v0.1-servidor-base        # solo el servidor, sin API ni interfaz
git checkout v0.2-datos-y-modelo       # datos y algoritmos, sin rutas todavia
git checkout v0.3-api-conectada        # API completa, sin interfaz visual
git checkout v1.0-presentacion-lista   # version completa
git checkout master                    # volver a la version actual
```

## La rama `antes-srp`

Ademas de `master`, este repositorio tiene una rama llamada `antes-srp` que
muestra una version del Controller que **no** aplica el Principio de
Responsabilidad Unica (SRP): mezcla el acceso a datos, las reglas de negocio
y la respuesta HTTP en un solo archivo. Sirve para comparar contra la version
en `master`, donde ese mismo trabajo esta repartido en tres archivos
(Controller, Model, Repository), cada uno con una sola responsabilidad.

```bash
git diff master antes-srp -- controllers/
```

## Estado

Completo y funcional.

- [x] Fase 1 — Preparacion del proyecto
- [x] Fase 2 — Estructura de carpetas MVC
- [x] Fase 3 — Servidor Express funcionando
- [x] Fase 4 — Datos y Model
- [x] Fase 5 — Rutas y Controller
- [x] Fase 6 — Interfaz y sala de maquinas
- [x] Demo de SOLID/SRP — rama `antes-srp`