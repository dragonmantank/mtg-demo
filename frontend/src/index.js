import React from 'react';
import ReactDOM from 'react-dom';
import { MachineProvider } from './context';
import { ThemeProvider, CSSReset, theme } from '@chakra-ui/core';
import App from './components/App';


ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <MachineProvider>
        <CSSReset />
        <App />
      </MachineProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
