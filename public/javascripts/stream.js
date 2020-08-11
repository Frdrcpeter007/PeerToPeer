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

    emmiter.volume = 0;
    emmiter.srcObject = stream;
    emmiter.play();

    var mediaRecorder = new MediaRecorder(stream),
        chunks = [];


    document.querySelector("#record").addEventListener("click", (e) => {
        mediaRecorder.start();

        setTimeout(() => {
            mediaRecorder.stop()
        }, 3500);
    })

    document.querySelector("#stopRecord").addEventListener("click", (e) => {
        setTimeout(() => {
            mediaRecorder.stop()
        }, 3500);
    })

    mediaRecorder.ondataavailable = function (ev) {
        chunks.push(ev.data)
    }

    mediaRecorder.onstop = (ev) => {
        let blob = new Blob(chunks, { 'type': 'video/mp4;' });

        console.log(chunks);
        chunks = [];
        let videoUrl = window.URL.createObjectURL(blob);

        postVideoToServer(blob);
    }
}

function postVideoToServer(videoblob) {

    var toFile = () => {
        videoblob.lastModifiedDate = new Date();
        videoblob.name = "frdrcpeter.mp4";
        return videoblob;
    }

    var fd = new FormData();
    fd.append('file-s3', toFile(), "Test");
    $.ajax({
        type: 'POST',
        url: 'http://localhost:5555/api/upload',
        data: fd,
        processData: false,
        contentType: false
    }).done(function (datas) {
        console.log(datas);
    });
}

function onUploadSuccess(datas) {
    console.log(datas);
    alert('video uploaded');
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