import { Machine, sendParent } from 'xstate';

export const gameMachine = Machine(
  {
    id: 'game',
    initial: 'idle',
    context: {
      gameId: null,
    },
    states: {
      idle: {
        on: {
          START: 'playing',
        },
      },
      playing: {
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
  {}
);
