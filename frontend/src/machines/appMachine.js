//top level app to manage states

// start in a lobby with a chat channel
// spawn player machines for others in channel
// on game join, create a game machine, start players video
import { Machine, assign, spawn } from 'xstate';
import { gameMachine } from './gameMachine';
import { playerMachine } from './playerMachine';
import axios from 'axios';

const normalizeResponse = (data) => ({
  conversationSession: data.conversation_session,
  gameId: data.room_id,
  videoSession: data.video_session,
});

export const appMachine = Machine(
  {
    id: 'app',
    initial: 'init',
    context: {
      gameData: {
        conversationSession: 'CON-f743bbf3-628b-479f-a651-39e458430be0',
        gameId: 'lcexzd0omv',
        videoSession:
          '2_MX40Njg3MzcwNH5-MTU5NjY3ODkxOTk0OH5wOCt6ZnlKS21iTkFsNlFlVStVb2dOR0d-UH4',
      },
      gameId: '',
      error: null,
    },
    states: {
      init: {
        id: 'init',
        entry: ['spawnPlayer'],
        on: {
          READY: '#lobby',
        },
      },
      lobby: {
        id: 'lobby',
        initial: 'idle',
        states: {
          idle: {},
          joining: {
            invoke: {
              src: 'findGame', //look up game and join if exists
              onDone: {
                target: '#game',
                actions: assign({
                  gameData: (_, e) => {
                    console.log(e.data);
                    return normalizeResponse(e.data.data);
                  },
                }),
              },
              onError: {
                target: '#lobby.error',
                actions: assign({
                  error: (ctx, e) => {
                    return e.data;
                  },
                }),
              },
            },
          },
          creating: {
            invoke: {
              src: 'createGame', //create new session on server for game
              onDone: {
                target: '#game',
                actions: assign({
                  gameData: (_, e) => {
                    return normalizeResponse(e.data.data);
                  },
                }),
              },
              onError: {
                target: '#lobby.error',
                actions: assign({
                  error: (ctx, e) => {
                    return 'There was an error creating the game.';
                  },
                }),
              },
            },
          },
          error: {
            id: 'error',
          },
        },
        on: {
          UPDATE_GAMEID: {
            actions: 'updateGameId',
          },
          JOIN: '.joining',
          CREATE: '.creating',
        },
      },
      game: {
        id: 'game',
        entry: ['spawnGame'],
        on: {
          FINISHED: {
            actions: 'clearGameInfo',
            target: '#lobby',
          },
        },
      },
      leave: {},
    },
  },
  {
    actions: {
      spawnPlayer: assign({
        selfRef: (ctx, e) => {
          return spawn(playerMachine);
        },
      }),
      spawnGame: assign({
        gameRef: (ctx, e) => {
          return spawn(
            gameMachine.withContext({
              gameData: ctx.gameData,
              selfRef: ctx.selfRef,
            })
          );
        },
      }),
      updateGameId: assign({ gameId: (_, e) => e.gameId }),
      clearGameInfo: assign({
        gameId: '',
        gameData: null,
        gameRef: null,
      }),
    },
    services: {
      createGame: () => axios.post('/game'),
      findGame: (ctx, e) => axios.get(`/game/${ctx.gameId}`),
    },
  }
);
