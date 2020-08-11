//Démarrage du Peer To peer au chargement
StartPeer(false);

//Initiation de la conversation
document.querySelector("#start").addEventListener("click", (e) => {
    StartPeer();
})

/**
 * 
 * @param {Boolean} initiator Oui ou Non est l'initiateur du Stream ```True``` par défaut
 */
function StartPeer(initiator = true) {
    navigator.getUserMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    );

    if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
        navigator.getUserMedia({
            video: true,
            audio: true
        }, (stream) => {
            streamHandler(stream, initiator);
        }, () => {
        });
    }
    else {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then((stream) => streamHandler(stream, initiator)).catch();
    }
}

/**
 * 
 * @param {MediaStream} stream Le stream de la personne devant la machine
 * @param {Boolean} initiator Oui ou Non est l'initiateur du Stream ```True``` par défaut
 */
function streamHandler(stream, initiator = true) {
    let p = new SimplePeer({
        initiator: initiator,
        stream,
        trickle: false
    });

    bindEvent(p);

    //Ajout des events
    let emmiter = document.querySelector("#emitter-video");

    emmiter.srcObject = stream;
    emmiter.play();
}

/**
 * Ecoute des events de la conncxion avec les autres clients
 * @param {ConnectionPeer} p 
 */
function bindEvent(p) {
    p.on("error", (err) => {
        console.log("Erreur", err);
    })

    p.on("signal", (data) => {
        document.querySelector("#offer").textContent = JSON.stringify(data)
    })

    p.on("stream", (stream) => {
        let receiver = document.querySelector("#receiver-video");

        receiver.volume = 0

        receiver.srcObject = stream;
        receiver.play();
    })

    document.querySelector("#incoming").addEventListener("submit", (e) => {
        e.preventDefault();
        p.signal(JSON.parse(e.target.querySelector("textarea").value))
    })
}