import { Machine, assign, sendParent } from 'xstate';
import axios from 'axios';
import OT from '@opentok/client';

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

               var publisher = OT.initPublisher('publisher', {
                 insertMode: 'append',
                 width: '100%',
                 height: '100%',
               });

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
