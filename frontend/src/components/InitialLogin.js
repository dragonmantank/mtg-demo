import React from 'react';
import { useService } from '@xstate/react';
import { Alert, AlertIcon, Button, Flex, Input } from '@chakra-ui/core';

function InitialLogin({ machine }) {
  const [state, send] = useService(machine);
  return (
    <Flex
      direction="column"
      h="200px"
      w="400px"
      p={6}
      backgroundColor="red"
      justifyContent="center"
      alignItems="center"
    >
      {state.value === 'error' ? (
        <Alert status="error">
          <AlertIcon />
          {state.context.error}
        </Alert>
      ) : null}
      <Input
        value={state.context.name}
        onChange={(e) =>
          send({ type: 'UPDATE_USERNAME', username: e.target.value })
        }
        placeholder="Enter Name"
        size="sm"
        mb={6}
      />
      <Button onClick={() => send({ type: 'JOIN_LOBBY' })}>Join Lobby</Button>
    </Flex>
  );
}

export default InitialLogin;
