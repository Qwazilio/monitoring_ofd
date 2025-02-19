import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.3:61708';

export default function useSocket() {
    const socketRef = useRef<Socket | null>(null)
    const [socket, setSocket] = useState<Socket | null>(null);
    useEffect(() => {
        const connection = io(SOCKET_URL, {
            transports: ['websocket']
            
        });

        socketRef.current = connection;
        setSocket(connection);

        return () => {
            
            if(socketRef.current) 
                if(socketRef.current.connected) 
                    socketRef.current.close()
        };
    }, []);
    
    return socket;
}
