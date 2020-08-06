// this machine track the details for a player
import { Machine, assign, sendParent, sendUpdate } from 'xstate';
import axios from 'axios';

const normalizeResponse = ({ member_id, lobby, user_id }) => ({
  lobby,
  memberId: member_id,
  userId: user_id,
});

export const playerMachine = Machine(
         {
           id: 'player',
           initial: 'login',
           context: {
             username: '',
             userData: null,
           },
           states: {
             login: {
               id: 'login',
               on: {
                 UPDATE_USERNAME: {
                   actions: 'updateUserName',
                 },
                 JOIN_LOBBY: '#joining',
               },
             },
             joining: {
               id: 'joining',
               invoke: {
                 src: 'joinLobby',
                 onDone: {
                   target: '#connected',
                   actions: 'updateUserData',
                 },
                 onError: {
                   target: '#login',
                   actions: 'logEvent',
                 },
               },
             },
             connected: {
               id: 'connected',
               entry: [sendUpdate(), sendParent('READY')],
             },
           },
         },
         {
           actions: {
             logEvent: (ctx, e) => console.log(e),
             updateUserData: assign({
               userData: (_, e) => normalizeResponse(e.data.data),
             }),
             updateUserName: assign({ username: (_, e) => e.username }),
           },
           services: {
             joinLobby: (ctx) =>
               axios.post('/lobby/users', { username: ctx.username }),
           },
         }
       );
