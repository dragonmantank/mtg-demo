import React from 'react';
import {
  Button,
  Input,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Heading,
} from '@chakra-ui/core';

import SearchList from './SearchList';
import SearchResult from './SearchResult';

function SearchDrawer({ isOpen, onClose }) {
  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="sm"
        isFullHeight
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader mt={6}>
            <Heading mb={3} size="md">
              Search Cards
            </Heading>
            <Input placeholder="Type Card Name" />
          </DrawerHeader>

          <DrawerBody overflow="auto">
            <SearchList />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button color="blue">Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SearchDrawer;
