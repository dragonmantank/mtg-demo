//top level app to manage states

// on init, spawn player machine
// start in a lobby with a chat channel
// spawn player machines for others in channel
// on game join, create a game machine, start players video
import { Machine, assign, spawn } from 'xstate';
import { gameMachine } from './gameMachine';
import { playerMachine } from './playerMachine';
const games = ['5678'];

const createNewGame = () =>
  new Promise((res, rej) => {
    games.push('1234');
    return res('1234');
  });

// replace this with game look up on server
const checkGameId = (gameId) =>
  new Promise((res, rej) => {
    console.log(gameId, games.indexOf(gameId));
    if (games.indexOf(gameId) === -1) {
      return rej('Game ID Not Found');
    }
    return res();
  });

export const appMachine = Machine(
         {
           id: 'app',
           initial: 'init',
           context: {
             gameId: '',
             error: null,
           },
           states: {
             init: {
               id: 'init',
               entry: ['spawnPlayer'],
               on: {
                 READY: '#lobby'
               }
             },
             lobby: {
               id: 'lobby',
               initial: 'idle',
               states: {
                 idle: {},
                 joining: {
                   invoke: {
                     src: 'joinGame', //look up game and join if exists
                     onDone: {
                       target: '#game',
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
                         gameId: (ctx, e) => {
                           return e.data;
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
                 return spawn(gameMachine.withContext({ gameId: ctx.gameId }));
               },
             }),
             updateGameId: assign({ gameId: (_, e) => e.gameId }),
             clearGameInfo: assign({
               gameId: '',
               gameRef: '',
             }),
             createPlayer: () => {
               console.log('new player created');
             },
           },
           services: {
             createGame: () => {
               // creates new game on server
               return createNewGame();
             },
             joinGame: (ctx, e) => {
               // validates game exists and
               return checkGameId(ctx.gameId);
             },
           },
         }
       );
