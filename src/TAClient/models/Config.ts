import { Models } from "./proto/models";

export interface Config {
    autoReconnect: boolean;
    autoReconnectInterval: number;
    autoReconnectMaxRetries: number;
    handshakeTimeout: number;
    autoInit: boolean;
    sendToSocket: ((data: any) => void) | null;
    connectionMode: Models.User.ClientTypes;
}
