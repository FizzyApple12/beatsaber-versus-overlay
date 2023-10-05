import { useEffect, useRef } from 'react';

import { useIsomorphicLayoutEffect } from 'usehooks-ts';
import { EventReceiver } from './ta-client/models/EventEmitter';

function useWSEvent<K extends keyof WebSocketEventMap>(
    eventName: K,
    handler: EventReceiver<WebSocketEventMap[K]>,
    client: WebSocket
) {
    // Create a ref that stores handler
    const savedHandler = useRef(handler);

    useIsomorphicLayoutEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!(client && client.addEventListener)) return;

        // Create event listener that calls handler function stored in ref
        const listener: typeof handler = (event) => savedHandler.current(event);

        client.addEventListener(eventName, listener);

        // Remove event listener on cleanup
        return () => {
            client.removeEventListener(eventName, listener);
        };
    }, [eventName, client]);
}

export { useWSEvent };
