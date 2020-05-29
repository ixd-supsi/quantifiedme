/*
 *  Commento audio
 *  Questo frammento di codice è inserito in tutte le pagine del progetto.
 *  Ha la funzione di inserire il commento audio,
 *  caricando il file 'commento.mp3' dalla cartella di progetto
 */

// -- Boot baby ----------------------------------------------------------------

window.addEventListener("load", run)

// Globali... possibile modifcarle
window.COMMENTO_BG_COLOR = "black"
window.COMMENTO_FG_COLOR = "white"

function run() {


    // --- Output --------------------------------------------------------------

    const mini_audio = document.createElement("div")
    mini_audio.style.cssText = `
        position: fixed;
        top: 0;
        left: 2em;
        z-index: 1000;
        display: none;
    `;
    document.body.appendChild(mini_audio)

    // --- Sound ---------------------------------------------------------------

    window.AudioContext = window.AudioContext || window.webkitAudioContext // WebKit 2020 ?

    const audio_ctx = new AudioContext()
    const sound = new Audio('commento.mp3')
    sound.load() // load() deve essere eseguito (Safari, vedi anche nota QUIRK, sotto)

    // sound.addEventListener("loadedmetadata", e => console.log("1. loadedmetadata"))
    // sound.addEventListener("loadeddata",     e => console.log("2. loadeddata"))
    // sound.addEventListener("canplay",        e => console.log("3. canplay"))
    // sound.addEventListener("canplaythrough", e => console.log("4. canplaythrough"))
    // sound.addEventListener("play",           e => console.log("5. play") )
    sound.addEventListener("ended", e => {
        // console.log("6. ended")
        sound.currentTime = 0
        sound_is_playing = false
        mini_audio.style.display = 'none'
    })

    let analyser, buffer_data
    let sound_is_playing = false
    let __run_once__ = false

    function toggle_sound(){
        // QUIRK: analyser DEVE essere creato dopo .load() su Safari (Versione 13.1)
        //             and DEVE essere creato dopo "canplay" event (???)
        //             and DEVE essere creato dopo "canplaythrough" event (???)
        //             (funziona in locale, ma non dal server)
        if(!__run_once__) {
            __run_once__ = true
            analyser = audio_ctx.createAnalyser()
            analyser.fftSize = 256
            analyser.connect(audio_ctx.destination)
            buffer_data = new Uint8Array(analyser.frequencyBinCount)
            const audio_src = audio_ctx.createMediaElementSource(sound)
            audio_src.connect(analyser)
            requestAnimationFrame(render)
        }
        if (sound_is_playing) {
            sound.pause()
            mini_audio.style.display = 'none'
            sound_is_playing = false
        } else {
            sound.play()
            mini_audio.style.display = 'block'
            sound_is_playing = true
        }
    }

    // --- Canvas --------------------------------------------------------------

    document.addEventListener("keydown", function(e){
        if (e.key == 'c' || e.key == 'C') {
           toggle_sound();
        }
    })

    // --- Canvas --------------------------------------------------------------

    const canvas = document.createElement("canvas")
    canvas.style.display = 'block'
    mini_audio.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    const w = 128
    const h = 32
    canvas.width = w
    canvas.height = h
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.fillStyle   = window.COMMENTO_BG_COLOR
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = window.COMMENTO_FG_COLOR
    ctx.lineWidth   = 1
    ctx.beginPath()
    ctx.moveTo(0, h/2)
    ctx.lineTo(w, h/2)
    ctx.stroke()

    function render() {

        requestAnimationFrame(render)

        analyser.getByteTimeDomainData(buffer_data)

        //ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = window.COMMENTO_BG_COLOR
        ctx.fillRect(0, 0, w, h)
        ctx.beginPath()
        for (let i=0; i<=buffer_data.length; i++){
            const y = (buffer_data[i]-128) / 128.0 * h*2 + h/2 + 0.5 // Per avere la linea nitida spostiamo di 0.5px
            ctx.lineTo(i, y)
        }
        ctx.stroke()

        const rad = 2.5
        const idx = Math.floor(sound.currentTime / sound.duration * (w-1)) || 0
        const y = (buffer_data[idx]-128) / 128.0 * h*2 + h/2 + 0.5
        ctx.beginPath()
        ctx.fillStyle = window.COMMENTO_FG_COLOR
        ctx.ellipse(idx+rad, y, rad, rad, 0, 0, Math.PI * 2, false)
        ctx.fill()
    }
}

