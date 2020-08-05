import React from 'react';
import { Button, Flex } from '@chakra-ui/core';
import { useService } from '@xstate/react';

function Game({ machine }) {
  const [state, send] = useService(machine);
  console.log('GAME', state);
  return (
    <Flex>
      {JSON.stringify(state.value)}
      {state.value === 'idle' ? (
        <>
          <Button onClick={() => send('START')}>Start Game</Button>
        </>
      ) : null}
      <Button onClick={() => send('END')}>End Game</Button>
    </Flex>
  );
}

export default Game;
