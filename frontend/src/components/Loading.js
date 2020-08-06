import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalContent,
  Spinner,
  Heading,
} from '@chakra-ui/core';

function Loading() {
  return (
    <Modal isOpen={true} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading>Loading</Heading>
        </ModalHeader>
        <ModalBody>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default Loading;


;