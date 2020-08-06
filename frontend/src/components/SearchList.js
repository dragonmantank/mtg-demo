import React from 'react';
import { Heading, List, ListItem, Image, Divider } from '@chakra-ui/core';

function SearchList() {
  return (
    <>
      <Heading size="sm">Card Search History</Heading>
      <Divider />
      <List>
        
        <ListItem mb={4} display="flex" direction="row" alignItems="center">
          <Image
            size="50px"
            objectFit="contain"
            src="https://img.scryfall.com/cards/small/front/a/6/a6712361-976a-4ef9-bae9-48505344904e.jpg?1592705660"
            alt="Forest"
          />
          <Heading size="xs">Card Name</Heading>
        </ListItem>

      </List>
    </>
  );
}

export default SearchList;
