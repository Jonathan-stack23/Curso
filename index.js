const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "mokepon.html"))
})

const jugadores = []

class Jugador {
  constructor(id) {
    this.id = id
    this.x = 0
    this.y = 0
    this.mokepon = null
    this.ataques = []
    this.ultimoUpdate = Date.now()
    this.enemigoBatalla = null
  }

  asignarMokepon(mokepon) {
    this.mokepon = mokepon
    this.ultimoUpdate = Date.now()
  }

  actualizarPosicion(x, y) {
    this.x = x
    this.y = y
    this.ultimoUpdate = Date.now()
  }

  asignarAtaques(ataques) {
    this.ataques = ataques
    this.ultimoUpdate = Date.now()
  }
}

class Mokepon {
  constructor(nombre) {
    this.nombre = nombre
  }
}

app.get("/unirse", (req, res) => {
  const id = `${Math.random()}`
  const jugador = new Jugador(id)
  jugadores.push(jugador)

  res.setHeader("Access-Control-Allow-Origin", "*")
  res.send(id)
})

app.post("/mokepon/:jugadorId", (req, res) => {
  const jugadorId = req.params.jugadorId || ""
  const nombre = req.body.mokepon || ""
  const mokepon = new Mokepon(nombre)
  
  const jugadorIndex = jugadores.findIndex((jugador) => jugadorId === jugador.id)

  if (jugadorIndex >= 0) {
    jugadores[jugadorIndex].asignarMokepon(mokepon)
  }
  
  res.end()
})

app.post("/mokepon/:jugadorId/posicion", (req, res) => {
  const jugadorId = req.params.jugadorId || ""
  const x = req.body.x || 0
  const y = req.body.y || 0

  const jugadorIndex = jugadores.findIndex((jugador) => jugadorId === jugador.id)

  if (jugadorIndex >= 0) {
    jugadores[jugadorIndex].actualizarPosicion(x, y)
  }

  // Limpiar jugadores inactivos (más de 30 segundos sin actividad)
  const ahora = Date.now()
  for (let i = jugadores.length - 1; i >= 0; i--) {
    if (jugadores[i].id !== jugadorId && ahora - jugadores[i].ultimoUpdate > 30000) {
      jugadores.splice(i, 1)
    }
  }

  const jugadorActual = jugadores.find((j) => j.id === jugadorId)
  let batallaCon = null

  if (jugadorActual && jugadorActual.enemigoBatalla) {
    const oponente = jugadores.find((j) => j.id === jugadorActual.enemigoBatalla)
    if (oponente && oponente.mokepon) {
      batallaCon = {
        id: oponente.id,
        nombre: oponente.mokepon.nombre,
        x: oponente.x,
        y: oponente.y
      }
    }
  }

  const enemigos = jugadores
    .filter((jugador) => jugadorId !== jugador.id && jugador.mokepon)
    .map((jugador) => ({
      id: jugador.id,
      x: jugador.x,
      y: jugador.y,
      mokepon: {
        nombre: jugador.mokepon.nombre
      }
    }))

  res.send({
    enemigos,
    batallaCon
  })
})

app.post("/mokepon/:jugadorId/colision", (req, res) => {
  const jugadorId = req.params.jugadorId || ""
  const enemigoId = req.body.enemigoId || ""

  const jugador = jugadores.find((j) => j.id === jugadorId)
  const enemigo = jugadores.find((j) => j.id === enemigoId)

  if (jugador) {
    jugador.enemigoBatalla = enemigoId
    jugador.ultimoUpdate = Date.now()
  }
  if (enemigo) {
    enemigo.enemigoBatalla = jugadorId
    enemigo.ultimoUpdate = Date.now()
  }

  res.end()
})

app.post("/mokepon/:jugadorId/ataques", (req, res) => {
  const jugadorId = req.params.jugadorId || ""
  const ataques = req.body.ataques || []
  
  const jugadorIndex = jugadores.findIndex((jugador) => jugadorId === jugador.id)

  if (jugadorIndex >= 0) {
    jugadores[jugadorIndex].asignarAtaques(ataques)
  }

  res.end()
})

app.get("/mokepon/:jugadorId/ataques", (req, res) => {
  const jugadorId = req.params.jugadorId || ""
  const jugador = jugadores.find((jugador) => jugador.id === jugadorId)
  if (jugador) {
    jugador.ultimoUpdate = Date.now()
  }
  res.send({
    ataques: (jugador && jugador.ataques) ? jugador.ataques : []
  })
})

const PORT = 8080
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`)
})