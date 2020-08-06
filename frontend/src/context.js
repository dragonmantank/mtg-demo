import React from 'react';
import { useMachine } from '@xstate/react';
import { appMachine } from './machines/appMachine';

const MachineContext = React.createContext();

function MachineProvider({ children }) {
  const [state, send, service] = useMachine(appMachine, { deferEvents: true });
  const value = {
    state,
    send,
    service
  };

  return (
    <MachineContext.Provider value={value}>{children}</MachineContext.Provider>
  );
}

export { MachineProvider, MachineContext };
