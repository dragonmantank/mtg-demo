import React, {useContext, useEffect} from 'react';
import { Button, Flex } from '@chakra-ui/core';
import { MachineContext } from '../context';
import { useService } from '@xstate/react';

function Game({ machine }) {
  const { state, send, service } = useContext(MachineContext);
  const [gameState, gameSend] = useService(state.context.gameRef);
  const [selfState, selfSend] = useService(state.context.selfRef);

  useEffect(() => {
    selfSend('START_VIDEO');
  }, [selfSend]);

  return (
    <Flex>
      <h2>Game {JSON.stringify(gameState.value)}</h2>
      <h2>Self {JSON.stringify(selfState.value)}</h2>
      {gameState.value === 'idle' ? (
        <>
          <Button onClick={() => gameSend('START')}>Start Game</Button>
        </>
      ) : null}
      <Button onClick={() => gameSend('END')}>End Game</Button>
    </Flex>
  );
}

export default Game;
