// this machine handles api calls as needed.

const promiseMachine = Machine({
  id: 'promise',
  initial: 'pending',
  states: {
    pending: {
      on: {
        // state transition (shorthand)
        // this is equivalent to { target: 'resolved' }
        RESOLVE: 'resolved',

        // state transition (object)
        REJECT: {
          target: 'rejected'
        }
      }
    },
    resolved: {
      type: 'final'
    },
    rejected: {
      type: 'final'
    }
  }
});