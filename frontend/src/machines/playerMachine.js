// this machine track the details for a player
import { Machine, assign, sendParent } from 'xstate';

export const playerMachine = Machine(
  {
    id: 'player',
    initial: 'idle',
    context: {
      name: '',
      user: null,
    },
    states: {
      idle: {},
      logging_in: {},
      connected: {},
    },
    on: {
      UPDATE_NAME: {
        actions: 'updateName',
      },
      JOIN_LOBBY: {
        actions: sendParent('READY')
      }
    },
  },
  {
    actions: {
      updateName: assign({ name: (_, e) => e.name }),
    },
  }
);
