import IO from 'socket.io-client'

// Main connects it once logged in: the login page and the share links run
// without a session.
export const createSocket = () => IO('/events', { autoConnect: false })
