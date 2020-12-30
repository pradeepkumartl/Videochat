let Peer = require('simple-peer');
let socket = io();
const video = document.querySelector('video');

let client = {};
let clientCount = 0;
let optionChoosen = '';

$("#layout").hide();
//$("#peerDiv").hide();
clicked = (option) => {
    $("#welcomePage").hide();
    $("#layout").show();
    optionChoosen = option;
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(stream => {
        socket.emit('NewClient');
        console.log('NewClient');
        video.srcObject = stream;
        video.play();

        function InitPeer(type){
            console.log('InitPeer');
            let peer = new Peer({initiator:(optionChoosen=='client')? true : false, stream: stream, trickle: false});
            peer.on('stream', (stream)=>{
                CreateVideo(stream);
            })
            return peer;
        }

        DisconnectPeer = () =>{
            console.log('DisconnectPeer');
            $("#peerDiv").hide();
            document.getElementById('peerVideo').remove();
            if(client.peer){
                client.peer.destroy();
            }
        }

        //Init type peer
        MakePeer = (count)=>{
            console.log('MakePeer');
            clientCount = count;
            client.gotAnswer = false;
            for(i=0; i < clientCount; i++){
                setTimeout(function(){
                    let peer = InitPeer('init');
                    peer.on('signal',(data)=>{
                        if(!client.gotAnswer){
                            socket.emit('offer', data)
                        }
                    })
                    client.peer = peer;
                }, 2000);
            }
        }

        frontAnswer = (offer)=>{
            console.log('FrontAnswer');
            let peer = InitPeer('notInit');
            peer.on('signal',(data)=>{
                socket.emit('Answer', data);
            })
            peer.signal(offer);
        }

        signalAnswer = (answer) =>{
            console.log('signalAnswer');
            client.gotAnswer = true;
            let peer = client.peer;
            peer.signal(answer);
        }

        CreateVideo=(stream)=>{
            console.log(clientCount);
            let videoDiv = document.createElement('div');
            videoDiv.id = 'peerDiv'+clientCount;
            videoDiv.classList.add('absoluteCls');
            let video = document.createElement('video');
            video.id = 'peerVideo'+clientCount;
            video.srcObject = stream;
            //video.class = 'embed-responsive-item';
            //videoDiv.show();
            videoDiv.appendChild(video);
            document.getElementById('mainVideo').appendChild(videoDiv)
            video.addEventListener('click',()=>{
                if(video.volume == 0){
                    video.volume = 1;
                } else {
                    video.volume = 0;
                }
            })
            video.play();
        }

        SessionActive = () =>{
            document.write('Session active please comeback later');
        }

        socket.on('BackOffer',frontAnswer);
        socket.on('BackAnswer',signalAnswer);
        socket.on('SessionActive',SessionActive);
        socket.on('CreatePeer',MakePeer);
        socket.on('Disconnect', DisconnectPeer);

    })
    .catch(error => {
        document.write(error);
    })
}
