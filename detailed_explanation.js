let APP_ID = "32319ddedc1a48889872c93e88eec184";
let token = null;   // no need to set in test mode
let uid = String(Math.floor(Math.random() * 10000))     // generating random uid
let client;
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
    // ask for permission for video and audio
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    document.getElementById('user-1').srcObject = localStream;

    createOffer();
}




let createOffer = async () => {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream;


    // we will get our local tracks and add them to the peer connection
    // we have our localStream, we will loop through all the audio and video tracks of this stream
    // and add them to our peer connection so that our remotePeer can get them
    localStream.getTracks().forEach(track =>{
        peerConnection.addTrack(track, localStream);
    })

    // Now we will Listen for when our peer actually has some tracks for us too
    // so at any time our remote peer add tracks to our peer connection then we want to get them
    // so we have an event listener for listening to those tracks which are sent by remote Peer
    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        })
    }

    // When we create an offer, we still need to create ice candidates so anytime we setup the local description
    // by default we have an event listener that can fire off here and its going to go ahead and actually
    // start generating our ice candidates
    // So here we will generate those ice candidate and console them out and later we will deal with signaling them out
    // we are just printing all icecandidates which are generated at time of setting localDescription
    peerConnection.onicecandidate = async (event)=> {
        if(event.candidate){
            console.log('New Ice Candidate: ', event.candidate);
        }
    }

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
}


let createAnswer = async() => {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream;

    localStream.getTracks().forEach(track =>{
        peerConnection.addTrack(track, localStream);
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        })
    }

    peerConnection.onicecandidate = async (event)=> {
        if(event.candidate){
            console.log('New Ice Candidate: ', event.candidate);
        }
    }
    // let offer = document.getElementById('offer-sdp').value
    if(!offer) return alert("Retrieve Offer from Peer First...")

    offer = JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
}


// let addAnswer = async () => {
//     let answer = document.getElementById('answer-sdp').value
//     if(!answer) return alert("Retrieve answer from Peer...")

//     answer = JSON.parse(answer);

//     if(!peerConnection.currentRemoteDescription){
//         peerConnection.setRemoteDescription(answer);
//     }
// }

init();

// document.getElementById('create-offer').addEventListener('click', createOffer)
// document.getElementById('create-answer').addEventListener('click', createAnswer)
// document.getElementById('add-answer').addEventListener('click', addAnswer)