import React from 'react';
import { Alert, AlertIcon, Box, Button, Flex, Input } from '@chakra-ui/core';

function Lobby({ context, status, send }) {
  return (
    <Flex p={20} h="100%" w="100%" direction="column">
      <Flex direction="row" justifyContent="space-between">
        <Button onClick={() => send({ type: 'CREATE' })}>Create Game</Button>
        <Flex direction="row" >
          {status === 'error' ? (
            <Alert status="error">
              <AlertIcon />
              {context.error}
            </Alert>
          ) : null}
          <Input
            value={context.gameId}
            onChange={(e) =>
              send({ type: 'UPDATE_GAMEID', gameId: e.target.value })
            }
            placeholder="Enter Game ID"
            size="sm"
          />
          <Button onClick={() => send({ type: 'JOIN' })}>Join Game</Button>
        </Flex>
      </Flex>
      <Flex mt={5} flex="1">
        <Box flex="3" bg="red.300">Chat Window</Box>
        <Box flex="1" bg="yellow.200">User Box</Box>
      </Flex>
    </Flex>
  );
}

export default Lobby;
