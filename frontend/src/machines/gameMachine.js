import { Machine, assign, sendParent } from 'xstate';
import axios from 'axios';

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
                 src: 'getVideoToken',
                 onDone: {
                   actions: assign({ videoToken: (_, e) => e.data.data.token })
                 }, 
                 onError: {
                   actions: () => console.log('Error getting token')
                 }
               },
               on: {
                 START: 'playing',
               },
             },
             playing: {
               invoke: { //init session, create publisher, subscribe to streams, publish
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
             getVideoToken: (ctx) => axios.post(`/game/${ctx.gameData.gameId}/token`),
           },
         }
       );
