const sectionSeleccionarAtaque = document.getElementById('seleccionar-ataque')
const sectionReiniciar = document.getElementById('reiniciar')
const botonMascotaJugador = document.getElementById('boton-mascota')
const botonReiniciar = document.getElementById('boton-reiniciar')
sectionReiniciar.style.display = 'none'

const sectionSeleccionarMascota = document.getElementById('seleccionar-mascota')
const spanMascotaJugador = document.getElementById('mascota-jugador')

const spanMascotaEnemigo = document.getElementById('mascota-enemigo')

const spanVidasJugador = document.getElementById('vidas-jugador')
const spanVidasEnemigo = document.getElementById('vidas-enemigo')

const sectionMensajes = document.getElementById('resultado')
const ataquesDelJugador = document.getElementById('ataques-del-jugador')
const ataquesDelEnemigo = document.getElementById('ataques-del-enemigo')
const contenedorTarjetas = document.getElementById('contenedorTarjetas')
const contenedorAtaques = document.getElementById('contenedorAtaques')

const sectionVerMapa = document.getElementById('ver-mapa')
const mapa = document.getElementById('mapa')

// Detección automática del backend: localhost o IP local
const API_URL = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : "http://localhost:8080"

let jugadorId = null
let enemigoId = null
let mokepones = []
let mokeponesEnemigos = []
let ataqueJugador = []
let ataqueEnemigo = []
let opcionDeMokepones
let inputHipodoge
let inputCapipepo
let inputRatigueya
let mascotaJugador
let mascotaJugadorObjeto
let ataquesMokepon
let ataquesMokeponEnemigo
let botonFuego
let botonAgua
let botonTierra
let botones = []
let indexAtaqueJugador
let indexAtaqueEnemigo
let victoriasJugador = 0
let victoriasEnemigo = 0 
let vidasJugador = 3
let vidasEnemigo = 3
let lienzo = mapa.getContext("2d")
let intervalo
let mapaBackground = new Image()
mapaBackground.src = './assets/mokemap.png'
let alturaQueBuscamos
let anchoDelMapa = window.innerWidth - 40
const anchoMaximoDelMapa = 380

let combateIniciado = false
let combateTerminado = false
let secuenciaIniciada = false

if (anchoDelMapa > anchoMaximoDelMapa) {
    anchoDelMapa = anchoMaximoDelMapa
}

alturaQueBuscamos = anchoDelMapa * 600 / 800

mapa.width = anchoDelMapa
mapa.height = alturaQueBuscamos

class Mokepon {
    constructor(nombre, foto, vida, fotoMapa, id = 0) {
        this.id = id
        this.nombre = nombre
        this.foto = foto
        this.vida = vida
        this.ataques = []
        this.ancho = 42
        this.alto = 42
        this.x = aleatorio(0, mapa.width - this.ancho)
        this.y = aleatorio(0, mapa.height - this.alto)
        this.mapaFoto = new Image()
        this.mapaFoto.src = fotoMapa
        this.velocidadX = 0
        this.velocidadY = 0
    }

    pintarMokepon(esPropio = false) {
        // Sombra suave bajo el personaje
        lienzo.save()
        lienzo.beginPath()
        lienzo.ellipse(this.x + this.ancho / 2, this.y + this.alto - 1, this.ancho / 2.2, 5, 0, 0, Math.PI * 2)
        lienzo.fillStyle = "rgba(0, 0, 0, 0.45)"
        lienzo.fill()
        lienzo.restore()

        // Dibujar el personaje
        lienzo.drawImage(
            this.mapaFoto,
            this.x,
            this.y,
            this.ancho,
            this.alto
        )

        // Pill moderna con el nombre y rol flotante
        const rolTexto = esPropio ? `Tú: ${this.nombre}` : `Rival: ${this.nombre}`
        lienzo.save()
        lienzo.font = "bold 10px 'Outfit', sans-serif"
        const textMetrics = lienzo.measureText(rolTexto)
        const pillWidth = textMetrics.width + 16
        const pillHeight = 16
        const pillX = this.x + (this.ancho / 2) - (pillWidth / 2)
        const pillY = this.y - pillHeight - 4

        lienzo.fillStyle = esPropio ? "rgba(16, 185, 129, 0.95)" : "rgba(239, 68, 68, 0.95)"
        if (lienzo.roundRect) {
            lienzo.beginPath()
            lienzo.roundRect(pillX, pillY, pillWidth, pillHeight, 8)
            lienzo.fill()
        } else {
            lienzo.fillRect(pillX, pillY, pillWidth, pillHeight)
        }

        lienzo.strokeStyle = "rgba(255, 255, 255, 0.45)"
        lienzo.lineWidth = 1
        lienzo.stroke()

        lienzo.fillStyle = "#ffffff"
        lienzo.textAlign = "center"
        lienzo.textBaseline = "middle"
        lienzo.fillText(rolTexto, this.x + (this.ancho / 2), pillY + (pillHeight / 2))
        lienzo.restore()
    }
}

let hipodoge = new Mokepon('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png')
let capipepo = new Mokepon('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png')
let ratigueya = new Mokepon('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png')

const HIPODOGE_ATAQUES = [
    { nombre: '💧', id: 'boton-agua' },
    { nombre: '💧', id: 'boton-agua' },
    { nombre: '💧', id: 'boton-agua' },
    { nombre: '🔥', id: 'boton-fuego' },
    { nombre: '🌱', id: 'boton-tierra' },
]

const CAPIPEPO_ATAQUES = [
    { nombre: '🌱', id: 'boton-tierra' },
    { nombre: '🌱', id: 'boton-tierra' },
    { nombre: '🌱', id: 'boton-tierra' },
    { nombre: '💧', id: 'boton-agua' },
    { nombre: '🔥', id: 'boton-fuego' },
]

const RATIGUEYA_ATAQUES = [
    { nombre: '🔥', id: 'boton-fuego' },
    { nombre: '🔥', id: 'boton-fuego' },
    { nombre: '🔥', id: 'boton-fuego' }, 
    { nombre: '💧', id: 'boton-agua' },
    { nombre: '🌱', id: 'boton-tierra' },
]

hipodoge.ataques.push(...HIPODOGE_ATAQUES)
capipepo.ataques.push(...CAPIPEPO_ATAQUES)
ratigueya.ataques.push(...RATIGUEYA_ATAQUES)

mokepones.push(hipodoge, capipepo, ratigueya)

function iniciarJuego() {
    sectionSeleccionarAtaque.style.display = 'none'
    sectionVerMapa.style.display = 'none'

    mokepones.forEach((mokepon) => {
        let tipoElemento = mokepon.nombre === 'Hipodoge' ? '💧 Agua' : (mokepon.nombre === 'Capipepo' ? '🌱 Tierra' : '🔥 Fuego')
        let claseTipo = mokepon.nombre === 'Hipodoge' ? 'tipo-agua' : (mokepon.nombre === 'Capipepo' ? 'tipo-tierra' : 'tipo-fuego')

        opcionDeMokepones = `
        <input type="radio" name="mascota" id=${mokepon.nombre} />
        <label class="tarjeta-de-mokepon ${claseTipo}" for=${mokepon.nombre}>
            <div class="tarjeta-header">
                <span class="tipo-badge">${tipoElemento}</span>
            </div>
            <div class="tarjeta-img-container">
                <img src=${mokepon.foto} alt=${mokepon.nombre}>
            </div>
            <p class="tarjeta-nombre">${mokepon.nombre}</p>
        </label>
        `
        contenedorTarjetas.innerHTML += opcionDeMokepones
    })

    inputHipodoge = document.getElementById('Hipodoge')
    inputCapipepo = document.getElementById('Capipepo')
    inputRatigueya = document.getElementById('Ratigueya')
    
    botonMascotaJugador.addEventListener('click', seleccionarMascotaJugador)
    botonReiniciar.addEventListener('click', reiniciarJuego)

    unirseAlJuego()
}

function unirseAlJuego() {
    fetch(`${API_URL}/unirse`)
    .then((res) => {
        if (res.ok) {
            res.text()
                .then((respuesta) => {
                    console.log("Jugador ID asignado:", respuesta);
                    jugadorId = respuesta
                })
        }
    })
    .catch((err) => {
        console.error("Error al conectarse al servidor:", err)
    })
}

function seleccionarMascotaJugador() {
    if (!jugadorId) {
        alert('Conectando con el servidor, por favor espera un momento...')
        return
    }

    if (inputHipodoge.checked) {
        spanMascotaJugador.innerHTML = inputHipodoge.id
        mascotaJugador = inputHipodoge.id
    } else if (inputCapipepo.checked) {
        spanMascotaJugador.innerHTML = inputCapipepo.id
        mascotaJugador = inputCapipepo.id
    } else if (inputRatigueya.checked) {
        spanMascotaJugador.innerHTML = inputRatigueya.id
        mascotaJugador = inputRatigueya.id
    } else {
        alert('Por favor selecciona una mascota para continuar')
        return
    }

    sectionSeleccionarMascota.style.display = 'none'

    seleccionarMokepon(mascotaJugador)
    extraerAtaques(mascotaJugador)
    sectionVerMapa.style.display = 'flex'
    iniciarMapa()
}

function seleccionarMokepon(mascotaJugador) {
    fetch(`${API_URL}/mokepon/${jugadorId}`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mokepon: mascotaJugador
        })
    })
}

function extraerAtaques(mascotaJugador) {
    let ataques
    for (let i = 0; i < mokepones.length; i++) {
        if (mascotaJugador === mokepones[i].nombre) {
            ataques = mokepones[i].ataques
        }
    }
    mostrarAtaques(ataques)
}

function mostrarAtaques(ataques) {
    contenedorAtaques.innerHTML = ''
    ataques.forEach((ataque) => {
        let extraClase = ''
        if (ataque.id === 'boton-fuego') extraClase = 'ataque-fuego'
        else if (ataque.id === 'boton-agua') extraClase = 'ataque-agua'
        else if (ataque.id === 'boton-tierra') extraClase = 'ataque-tierra'

        ataquesMokepon = `
        <button id=${ataque.id} class="boton-de-ataque BAtaque ${extraClase}">${ataque.nombre}</button>
        `
        contenedorAtaques.innerHTML += ataquesMokepon
    })

    botonFuego = document.getElementById('boton-fuego')
    botonAgua = document.getElementById('boton-agua')
    botonTierra = document.getElementById('boton-tierra')
    botones = document.querySelectorAll('.BAtaque')
}

function secuenciaAtaque() {
    if (secuenciaIniciada) return
    secuenciaIniciada = true

    botones.forEach((boton) => {
        boton.addEventListener('click', (e) => {
            const ataqueNombre = e.target.textContent.trim()
            if (ataqueNombre === '🔥') {
                ataqueJugador.push('FUEGO')
                boton.disabled = true   
            } else if (ataqueNombre === '💧') {
                ataqueJugador.push('AGUA')
                boton.disabled = true  
            } else {
                ataqueJugador.push('TIERRA')
                boton.disabled = true  
            }

            if (ataqueJugador.length < 5) {
                sectionMensajes.innerHTML = `Ataque ${ataqueJugador.length} de 5 seleccionado`
            } else if (ataqueJugador.length === 5) {
                sectionMensajes.innerHTML = '⏳ Esperando que el rival complete sus ataques...'
                enviarAtaques()
            }
        })
    })
}

function enviarAtaques() {
    console.log('Enviar ataques', ataqueJugador);

    fetch(`${API_URL}/mokepon/${jugadorId}/ataques`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ataques: ataqueJugador
        })
    })

    intervalo = setInterval(obtenerAtaques, 100)
}

function obtenerAtaques() {
    console.log('OBTENER ATAQUES');
    
    fetch(`${API_URL}/mokepon/${enemigoId}/ataques`)
        .then(function (res) {
            if (res.ok) {
                res.json()
                .then(function ({ ataques }) {
                    if (ataques && ataques.length === 5) {
                        ataqueEnemigo = ataques
                        combate()
                    }
                })
            }
        })
        .catch(err => console.error("Error al obtener ataques:", err))
}

function seleccionarMascotaEnemigo(enemigo) {
    spanMascotaEnemigo.innerHTML = enemigo.nombre
    ataquesMokeponEnemigo = enemigo.ataques || []
    secuenciaAtaque()
}

function indexAmbosOponente(jugador, enemigo) {
    indexAtaqueJugador = ataqueJugador[jugador]
    indexAtaqueEnemigo = ataqueEnemigo[enemigo]
}

function combate() {
    if (combateTerminado) return
    combateTerminado = true

    clearInterval(intervalo)
    console.log('COMBATE');
    
    for (let index = 0; index < ataqueJugador.length; index++) {
        if(ataqueJugador[index] === ataqueEnemigo[index]) {
            indexAmbosOponente(index, index)
            crearMensaje("EMPATE")
        } else if (ataqueJugador[index] === 'FUEGO' && ataqueEnemigo[index] === 'TIERRA') {
            indexAmbosOponente(index, index)
            crearMensaje("GANASTE")
            victoriasJugador++
            spanVidasJugador.innerHTML = victoriasJugador
        } else if (ataqueJugador[index] ==='AGUA' && ataqueEnemigo[index] === 'FUEGO') {
            indexAmbosOponente(index, index)
            crearMensaje("GANASTE")
            victoriasJugador++
            spanVidasJugador.innerHTML = victoriasJugador
        } else if (ataqueJugador[index] === 'TIERRA' && ataqueEnemigo[index] === 'AGUA') {
            indexAmbosOponente(index, index)
            crearMensaje("GANASTE")
            victoriasJugador++
            spanVidasJugador.innerHTML = victoriasJugador
        } else {
            indexAmbosOponente(index, index)
            crearMensaje("PERDISTE")
            victoriasEnemigo++
            spanVidasEnemigo.innerHTML = victoriasEnemigo
        }
    }

    revisarVidas()
}

function revisarVidas() {
    if (victoriasJugador === victoriasEnemigo) {
        crearMensajeFinal("⚖️ ¡Esto fue un Gran Empate!")
    } else if (victoriasJugador > victoriasEnemigo) {
        crearMensajeFinal("🏆 ¡FELICITACIONES! ¡Has ganado la batalla!")
    } else {
        crearMensajeFinal('💀 Lo sentimos, has sido derrotado...')
    }
}

function crearMensaje(resultado) {
    let nuevoAtaqueDelJugador = document.createElement('p')
    let nuevoAtaqueDelEnemigo = document.createElement('p')

    sectionMensajes.innerHTML = resultado

    let iconJugador = indexAtaqueJugador === 'FUEGO' ? '🔥' : (indexAtaqueJugador === 'AGUA' ? '💧' : '🌱')
    let iconEnemigo = indexAtaqueEnemigo === 'FUEGO' ? '🔥' : (indexAtaqueEnemigo === 'AGUA' ? '💧' : '🌱')

    nuevoAtaqueDelJugador.innerHTML = `${iconJugador} ${indexAtaqueJugador}`
    nuevoAtaqueDelEnemigo.innerHTML = `${iconEnemigo} ${indexAtaqueEnemigo}`

    nuevoAtaqueDelJugador.className = 'ataque-item item-' + indexAtaqueJugador.toLowerCase()
    nuevoAtaqueDelEnemigo.className = 'ataque-item item-' + indexAtaqueEnemigo.toLowerCase()

    ataquesDelJugador.appendChild(nuevoAtaqueDelJugador)
    ataquesDelEnemigo.appendChild(nuevoAtaqueDelEnemigo)
}

function crearMensajeFinal(resultadoFinal) {
    sectionMensajes.innerHTML = resultadoFinal
    sectionReiniciar.style.display = 'block'
}

function reiniciarJuego() {
    location.reload()
}

function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function pintarCanvas() {
    mascotaJugadorObjeto.x = mascotaJugadorObjeto.x + mascotaJugadorObjeto.velocidadX
    mascotaJugadorObjeto.y = mascotaJugadorObjeto.y + mascotaJugadorObjeto.velocidadY

    // Límites para que el personaje no se salga del mapa
    if (mascotaJugadorObjeto.x < 0) {
        mascotaJugadorObjeto.x = 0
    } else if (mascotaJugadorObjeto.x > mapa.width - mascotaJugadorObjeto.ancho) {
        mascotaJugadorObjeto.x = mapa.width - mascotaJugadorObjeto.ancho
    }

    if (mascotaJugadorObjeto.y < 0) {
        mascotaJugadorObjeto.y = 0
    } else if (mascotaJugadorObjeto.y > mapa.height - mascotaJugadorObjeto.alto) {
        mascotaJugadorObjeto.y = mapa.height - mascotaJugadorObjeto.alto
    }

    lienzo.clearRect(0, 0, mapa.width, mapa.height)
    lienzo.drawImage(
        mapaBackground,
        0,
        0,
        mapa.width,
        mapa.height
    )
    
    // Dibujar mascota propia con rol "Tú"
    mascotaJugadorObjeto.pintarMokepon(true)

    enviarPosicion(mascotaJugadorObjeto.x, mascotaJugadorObjeto.y)

    // Dibujar enemigos con rol "Rival"
    mokeponesEnemigos.forEach(function (mokepon) {
        mokepon.pintarMokepon(false)
        revisarColision(mokepon)
    })
}

function crearMokeponEnemigo(enemigoServidor) {
    const mokeponNombre = (enemigoServidor.mokepon && enemigoServidor.mokepon.nombre) || enemigoServidor.nombre || ""
    const base = mokepones.find(m => m.nombre === mokeponNombre)
    if (!base) return null

    let mokeponEnemigo = new Mokepon(base.nombre, base.foto, base.vida, base.mapaFoto.src, enemigoServidor.id)
    mokeponEnemigo.mapaFoto = base.mapaFoto
    mokeponEnemigo.ataques = base.ataques
    mokeponEnemigo.x = enemigoServidor.x || 0
    mokeponEnemigo.y = enemigoServidor.y || 0
    return mokeponEnemigo
}

function actualizarMokeponesEnemigos(enemigosServidor) {
    const idsServidor = enemigosServidor.map(e => e.id)

    // Filtrar los que ya no están en el servidor
    mokeponesEnemigos = mokeponesEnemigos.filter(e => idsServidor.includes(e.id))

    enemigosServidor.forEach(enemigoServidor => {
        let existente = mokeponesEnemigos.find(e => e.id === enemigoServidor.id)
        if (existente) {
            existente.x = enemigoServidor.x || 0
            existente.y = enemigoServidor.y || 0
        } else {
            let nuevo = crearMokeponEnemigo(enemigoServidor)
            if (nuevo) {
                mokeponesEnemigos.push(nuevo)
            }
        }
    })
}

function enviarPosicion(x, y) {
    if (!jugadorId) return

    fetch(`${API_URL}/mokepon/${jugadorId}/posicion`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            x,
            y
        })
    })
    .then(function (res) {
        if (res.ok) {
            res.json()
            .then(function ({ enemigos, batallaCon }) {
                // Si el servidor indica que entramos en batalla con alguien
                if (batallaCon && !combateIniciado) {
                    let enemigoEncontrado = mokeponesEnemigos.find(m => m.id === batallaCon.id)
                    if (!enemigoEncontrado) {
                        enemigoEncontrado = crearMokeponEnemigo(batallaCon)
                    }
                    if (enemigoEncontrado) {
                        iniciarBatalla(enemigoEncontrado)
                        return
                    }
                }

                actualizarMokeponesEnemigos(enemigos || [])
            })
        }
    })
    .catch(function (error) {
        console.error("Error al enviar posición:", error)
    })
}

function moverDerecha() {
    mascotaJugadorObjeto.velocidadX = 5
}

function moverIzquierda() {
    mascotaJugadorObjeto.velocidadX = -5
}

function moverAbajo() {
    mascotaJugadorObjeto.velocidadY = 5
}

function moverArriba() {
    mascotaJugadorObjeto.velocidadY = -5
}

function detenerMovimiento() {
    mascotaJugadorObjeto.velocidadX = 0
    mascotaJugadorObjeto.velocidadY = 0
}

function sePresionoUnaTecla(event) {
    switch (event.key) {
        case 'ArrowUp':
            moverArriba()
            break
        case 'ArrowDown':
            moverAbajo()
            break
        case 'ArrowLeft':
            moverIzquierda()
            break
        case 'ArrowRight':
            moverDerecha()
            break
        default:
            break
    }
}

function iniciarMapa() {
    mascotaJugadorObjeto = obtenerObjetoMascota(mascotaJugador)
    mascotaJugadorObjeto.x = aleatorio(0, mapa.width - mascotaJugadorObjeto.ancho)
    mascotaJugadorObjeto.y = aleatorio(0, mapa.height - mascotaJugadorObjeto.alto)

    console.log(mascotaJugadorObjeto, mascotaJugador);
    intervalo = setInterval(pintarCanvas, 50)
    
    window.addEventListener('keydown', sePresionoUnaTecla)
    window.addEventListener('keyup', detenerMovimiento)
}

function obtenerObjetoMascota() {
    for (let i = 0; i < mokepones.length; i++) {
        if (mascotaJugador === mokepones[i].nombre) {
            return mokepones[i]
        }
    }
}

function revisarColision(enemigo) {
    if (combateIniciado) return

    const arribaEnemigo = enemigo.y
    const abajoEnemigo = enemigo.y + enemigo.alto
    const derechaEnemigo = enemigo.x + enemigo.ancho
    const izquierdaEnemigo = enemigo.x

    const arribaMascota = mascotaJugadorObjeto.y
    const abajoMascota = mascotaJugadorObjeto.y + mascotaJugadorObjeto.alto
    const derechaMascota = mascotaJugadorObjeto.x + mascotaJugadorObjeto.ancho
    const izquierdaMascota = mascotaJugadorObjeto.x

    if(
        abajoMascota < arribaEnemigo ||
        arribaMascota > abajoEnemigo ||
        derechaMascota < izquierdaEnemigo ||
        izquierdaMascota > derechaEnemigo
    ) {
        return
    }

    console.log('Se detectó una colisión con:', enemigo.nombre);
    iniciarBatalla(enemigo)
}

function iniciarBatalla(enemigo) {
    if (combateIniciado) return
    combateIniciado = true

    detenerMovimiento()
    clearInterval(intervalo)

    enemigoId = enemigo.id

    // Notificar al servidor de la batalla/colisión
    fetch(`${API_URL}/mokepon/${jugadorId}/colision`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            enemigoId: enemigo.id
        })
    }).catch(err => console.error("Error al reportar colisión:", err))

    sectionSeleccionarAtaque.style.display = 'flex'
    sectionVerMapa.style.display = 'none'
    seleccionarMascotaEnemigo(enemigo)
}

window.addEventListener('load', iniciarJuego)
