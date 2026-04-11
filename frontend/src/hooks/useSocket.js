import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (departmentId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    if (departmentId) {
      socketRef.current.emit('join-department', departmentId);
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [departmentId]);

  return socketRef.current;
};

export default useSocket;