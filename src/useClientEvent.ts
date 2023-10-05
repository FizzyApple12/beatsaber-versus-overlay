import { useEffect, useRef } from 'react';

import { useIsomorphicLayoutEffect } from 'usehooks-ts';
import { Client } from './ta-client/lib/client';
import { TAEvents } from './ta-client/models/TAEvents';
import { EventReceiver } from './ta-client/models/EventEmitter';

function useClientEvent<K extends keyof TAEvents.Events>(
    eventName: K,
    handler: EventReceiver<TAEvents.Events[K]>,
    client: Client
) {
    // Create a ref that stores handler
    const savedHandler = useRef(handler);

    useIsomorphicLayoutEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!(client && client.on)) return;

        // Create event listener that calls handler function stored in ref
        const listener: typeof handler = (event) => savedHandler.current(event);

        client.on(eventName, listener);

        // Remove event listener on cleanup
        return () => {
            client.off(eventName, listener);
        };
    }, [eventName, client]);
}

export { useClientEvent };
