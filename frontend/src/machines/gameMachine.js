import { Machine, assign, sendParent } from 'xstate';
import axios from 'axios';
import OT from '@opentok/client';
import { createWorker, createScheduler, PSM } from 'tesseract.js';

const nomralizeResponse = ({ conversation_token, member_id, ot_token }) => ({
  converationToken: conversation_token,
  memberId: member_id,
  videoToken: ot_token,
});

export const gameMachine = Machine(
         {
           id: 'game',
           initial: 'init',
           context: {
             gameData: null,
             selfRef: null,
             oppRef: null,
           },
           states: {
             init: {
               id: 'init',
               invoke: {
                 src: 'getTokens',
                 onDone: {
                   target: 'playing',
                   actions: assign({
                     tokens: (_, e) => nomralizeResponse(e.data.data),
                   }),
                 },
                 onError: {
                   actions: () => console.log('Error getting token'),
                 },
               },
             },
             playing: {
               invoke: {
                 //init session, create publisher, subscribe to streams, publish
                 src: 'startVideo',
               },
               on: {
                 INC_HEALTH: {},
                 DEC_HEALTH: {},
               },
             },
             finished: {
               type: 'final',
             },
           },
           on: {
             END: {
               actions: sendParent('FINISHED'),
               target: 'finished',
             },
           },
         },
         {
           services: {
             getTokens: (ctx) => {
               let { userId } = ctx.selfRef.state.context.userData;
               return axios.post(`/game/${ctx.gameData.gameId}/token`, {
                 user_id: userId,
               });
             },

             startVideo: (ctx) => (cb) => {
               // OCR stuff
               const worker = createWorker();
               const scheduler = createScheduler();
               const rectangle = { left: 120, top: 150, width: 400, height: 60 };

               let timerId = null;
               let intervalID = null;
               let previousMatch = '';
               let madeAPIcall = false;

               const videoContainer = document.querySelector('#video-container');
               const video = document.querySelector('video');
               const helpSection = document.querySelector('#help-section');

               const constraints = {
                 audio: true,
                 video: {
                   width: { min: 1024, ideal: 1280, max: 1920 },
                   height: { min: 576, ideal: 720, max: 1080 },
                 }};

               let publisher;

               const makeAPIcall = (query) => {
                 console.log('makeAPIcall');
                 clearInterval(timerId);
                 helpSection.style.border =  "none";
                 madeAPIcall = false;
                 fetch(`https://api.scryfall.com/cards/named?fuzzy=${query}`)
                     .then(response => response.json())
                     .then(data => {
                       console.log(data);
                     });
                 intervalID = setTimeout(() => { startTimer(); }, 10000);
               }


               const doOCR = async () => {
                 console.log('doOCR!');
                 const c = document.createElement('canvas');
                 c.width = 640;
                 c.height = 360;
                 c.getContext('2d').drawImage(video, 0, 0, 640, 360);
                 // const start = new Date();
                 const { data: {  text, ...data } } = await scheduler.addJob('recognize', c, { rectangle });
                 // console.log('data: ',data);
                 // const end = new Date();
                 const regex = /([A-Z])\w{2,}/g;
                 const matches = text.match(regex)
                 if (matches){
                   if (data.lines.length === 1 && matches.length > 0){
                     let currentMatch = matches.join(' ');
                     console.log(`${previousMatch} || ${currentMatch}`);
                     if (previousMatch === currentMatch ){
                       helpSection.style.border =  "3px solid green";
                       previousMatch = '';
                       setTimeout( () => {makeAPIcall(matches.join('+'));}, 1000 );
                     } else {
                       previousMatch = currentMatch;
                     }
                   }
                 }
               };

               const startTimer = () => {
                 console.log('start timer');
                 clearInterval(timerId);
                 console.log('startTimer');
                 previousMatch = '';
                 helpSection.style.border =  "1px solid red";
                 timerId = setInterval(doOCR, 1000);
               }

               navigator.mediaDevices.getUserMedia(constraints)
               .then(async function(mediaStream) {
                 console.log('mediaStream: ', mediaStream);
                 video.srcObject = mediaStream;
                 video.onloadedmetadata = function(e) {
                   video.play();
                   const stream = video.captureStream();
                   const videoTracks = stream.getVideoTracks();
                   const audioTracks = stream.getAudioTracks();

                   publisher = OT.initPublisher('publisher', {
                     insertMode: 'append',
                     videoSource: videoTracks[0],
                     audioSource: audioTracks[0],
                     width: '100%',
                     height: '100%',
                   });
                 };
                 //start the OCR
                 console.log('Initializing Tesseract.js')
                 for (let i = 0; i < 4; i++) {
                   const worker = createWorker();
                   await worker.load();
                   await worker.loadLanguage('eng');
                   await worker.initialize('eng');
                   await worker.setParameters({
                     tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
                   });
                   scheduler.addWorker(worker);
                 }
                 video.addEventListener('pause', () => {
                   clearInterval(timerId);
                 });
                 video.controls = true;
                 console.log('Tesseract.js Initialized');
                 startTimer();
               })
               .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

               let session = OT.initSession(
                 process.env.REACT_APP_OT_KEY,
                 ctx.gameData.videoSession
               );

               session.on('streamCreated', (e) => {
                 session.subscribe(e.stream, 'subscriber', {
                   insertMode: 'append',
                   width: '100%',
                   height: '100%',
                 });
               });

               // var publisher = OT.initPublisher('publisher', {
               //   insertMode: 'append',
               //   width: '100%',
               //   height: '100%',
               // });

               session.connect(ctx.tokens.videoToken, (error) => {
                 if (error) {
                   console.log(error);
                 } else {
                   session.publish(publisher);
                 }
               });

               return () => session.disconnect();
             },
           },
         }
       );
