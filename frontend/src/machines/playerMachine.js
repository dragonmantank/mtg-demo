// this machine track the details for a player
import { Machine, assign, sendParent } from 'xstate';

export const playerMachine = Machine(
  {
    id: 'player',
    initial: 'log_in',
    context: {
      name: '',
      user: null,
    },
    states: {
      log_in: {
        id: 'log_in',
        on: {
          UPDATE_NAME: {
            actions: 'updateName',
          },
          JOIN_LOBBY: { 
            // create conversation user before sending ready
            actions: sendParent('READY'),
          },
        },
      },
      connected: {},
      playing: {
        id: 'playing',
        initial: 'init',
        states: {
          init: {
            invoke: [
              {
                src: 'getVideoToken',
              },
              {
                src: 'joinConversation',
              },
            ],
          },
          ready: {
            // create publisher
            // publish video
            // listen for events - video, conversations
          },
        },
        on: {
          START_VIDEO: {
            actions: () => console.log('starting video'),
            target: 'playing',
          },
        },
      },
    },
  },
  {
    actions: {
      updateName: assign({ name: (_, e) => e.name }),
    },
    services: {
      getVideoToken: () => {
        console.log('Getting Token');
      },
      joinConversation: () => {
        console.log('Joining Conversation');
      },
    },
  }
);
