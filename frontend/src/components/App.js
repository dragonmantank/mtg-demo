import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/core';
import { useMachine } from '@xstate/react';
import { appMachine } from '../machines/appMachine';
import InitialLogin from './InitialLogin';
import Game from './Game';
import Lobby from './Lobby';

function App() {
  const [state, send, service] = useMachine(appMachine, { deferEvents: true });


  useEffect(() => {
    const subscription = service.subscribe((state) => {
      // simple state logging
      console.log('APP STATE', state);
      console.log('Player State', state.context.selfRef.state)
    });

    return subscription.unsubscribe;
  }, [service]);

  return (
    <Flex h="100vh" w="100vw" justifyContent="center" alignItems="center">
      {state.value === 'init' ? (
        <InitialLogin machine={state.context.selfRef} />
      ) : null}
      {state.value.lobby ? (
        <Lobby status={state.value.lobby} context={state.context} send={send} />
      ) : null}
      {state.value === 'game' ? <Game machine={state.context.gameRef} /> : null}
    </Flex>
  );
}

export default App;
