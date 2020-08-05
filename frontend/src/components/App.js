import React, { useContext, useEffect } from 'react';
import { MachineContext } from '../context';
import { Flex } from '@chakra-ui/core';

import InitialLogin from './InitialLogin';
import Game from './Game';
import Lobby from './Lobby';

function App() {
  const { state, send, service } = useContext(MachineContext);

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      // simple state logging
      console.log(state);
    });

    return subscription.unsubscribe;
  }, [service]);

  return (
    <Flex h="100vh" w="100vw" justifyContent="center" alignItems="center">
      {state.value === 'init' ? (
        <InitialLogin machine={state.context.selfRef} />
      ) : null}
      {state.value.lobby ? (
        <Lobby
          status={state.value.lobby}
          context={state.context}
          send={send}
        />
      ) : null}
      {state.value === 'game' ? (
        <Game machine={state.context.gameRef} />
      ) : null}
    </Flex>
  );
}

export default App;
