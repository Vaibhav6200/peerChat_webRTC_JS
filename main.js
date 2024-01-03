// import AgoraRTM from 'agora-rtm-sdk';


let APP_ID = "32319ddedc1a48889872c93e88eec184";
let token = null;   // no need to set in test mode
let uid = String(Math.floor(Math.random() * 10000))     // Each user who logs in should have a unique id
let client;     // it will be entire interface for client connection
let channel;    // this is the channel which two users actually join


// output camera feed to page
let localStream;    // contains data of local video and audio
let remoteStream;    // contains data of friends video and audio
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

let init = async () => {
    // client = await AgoraRTM

    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    document.getElementById('user-1').srcObject = localStream;
}


let createPeerConnection = async (sdpType) => {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream;

    localStream.getTracks().forEach(track =>{
        peerConnection.addTrack(track, localStream);
    })

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach(track =>{
            remoteStream.addTrack(track);
        })
    }

    peerConnection.onicecandidate = async (event)=> {
        if(event.candidate){
            document.getElementById(sdpType).value = JSON.stringify(peerConnection.localDescription)
        }
    }
}


let createOffer = async () => {
    createPeerConnection('offer-sdp')

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    document.getElementById('offer-sdp').value = JSON.stringify(offer);
}


let createAnswer = async() => {
    createPeerConnection('answer-sdp')

    let offer = document.getElementById('offer-sdp').value
    if(!offer) return alert("Retrieve Offer from Peer First...")

    offer = JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
}


let addAnswer = async () => {
    let answer = document.getElementById('answer-sdp').value
    if(!answer) return alert("Retrieve answer from Peer...")

    answer = JSON.parse(answer);

    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer);
    }
}

document.getElementById('create-offer').addEventListener('click', createOffer)
document.getElementById('create-answer').addEventListener('click', createAnswer)
document.getElementById('add-answer').addEventListener('click', addAnswer)


init();
