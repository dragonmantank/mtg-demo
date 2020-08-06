import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  useDisclosure,
} from '@chakra-ui/core';
import { useService } from '@xstate/react';
import SearchDrawer from './SearchDrawer';
import Loading from './Loading';

function Game({ machine }) {
  const [state, send] = useService(machine);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <>
      <Button
        position="absolute"
        right={0}
        top={5}
        onClick={onOpen}
        aria-label="Search Cards"
        rightIcon="search"
      >
        Search
      </Button>
      {state.value === 'init' ? <Loading /> : null}

      <SearchDrawer isOpen={isOpen} onClose={onClose} />
      <Flex direction="column" w="90vw">
        <Flex direction="row" mb={10} justifyContent="space-between">
          <Heading>Game ID {state.context.gameData.gameId}</Heading>
          <Button onClick={() => send('END')}>End Game</Button>
        </Flex>

        <Flex direction="row" justifyContent="space-around">
          <Flex direction="column" w={['640px']}>

            <div id="media-container">

              <label htmlFor="audio-source-select">Audio Source:</label><select id="audio-source-select"></select><br/>
              <label htmlFor="video-source-select">Video Source:</label><select id="video-source-select"></select>
              <br/>
              <button id="publish-btn" type="button">Publish</button>

            </div>

            <div id="video-container">
              <video width="640" height="360" crossOrigin="anonymous" muted></video>
              <div id="help-section"></div>
            </div>

            <Box id="publisher" h={['0']} w="0" bg="red.300"></Box>
            <Flex
              h="100px"
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Heading>Player Name</Heading>
              <Flex direction="row" alignItems="center">
                <Icon name="minus" size="24px" />
                <Heading ml={5} mr={5}>
                  20
                </Heading>
                <Icon name="add" size="24px" />
              </Flex>
            </Flex>
          </Flex>

          <Flex direction="column" w={['640px']}>
            <Box id="subscriber" h={['360px']} w="100%" bg="blue.300"></Box>
            <Flex
              h="100px"
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Heading>Player Name</Heading>
              <Heading>20</Heading>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

// function Game() {
//   const { state, send, service } = useContext(MachineContext);
//   const [gameState, gameSend] = useService(state.context.gameRef);


//   return (
//     <Flex direction="row">
//       <h2>Game {JSON.stringify(gameState.context.gameData.gameId)}</h2>
//       <h2>Self {JSON.stringify(selfState.value)}</h2>
//       <Box id="publisher" h="400px"></Box>
//       <Box id="subscriber" h="400px"></Box>
//       {gameState.value === 'init' ? (
//         <>
//           <Button onClick={() => gameSend('START')}>Start Game</Button>
//         </>
//       ) : null}
//       <Button onClick={() => gameSend('END')}>End Game</Button>
//     </Flex>
//   );
// }

export default Game;
