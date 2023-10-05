import EventEmitter from "events";
import { Config } from "../models/Config";
import { Emitter } from "../models/EventEmitter";
import { Models } from "../models/proto/models";
import { Packets } from "../models/proto/packets";
import { ITransport } from "../models/Transport";

export interface ConnectionOptions {
    url: string;
    password?: string;
    options?: Partial<Config>;
}

export class TAWebsocket {
    readonly url: string;
    readonly password?: string;

    private ws: WebSocket | null = null;

    private _config: Config;

    public get config(): Config {
        return { ...this._config };
    }

    private reconnectAttempts = -1;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    private sendToSocket: (data: any) => void = d => this.ws?.send(d);

    public emitter: Emitter<ITransport.Events> = new EventEmitter();

    constructor({ url, password, options }: ConnectionOptions) {
        this._config = this.loadConfig(options);
        this.url = url;
        this.password = password;

        if (this.config.autoInit) this.init();
        if (this.config.sendToSocket) {
            this.sendToSocket = this.config.sendToSocket;
        }
        if (this.config.autoReconnectMaxRetries !== -1) this.reconnectAttempts = 1;
    }

    private loadConfig(config?: Partial<Config>): Config {
        return {
            autoReconnect: true,
            autoReconnectInterval: 10000,
            autoReconnectMaxRetries: -1,
            handshakeTimeout: 0,
            autoInit: true,
            sendToSocket: null,
            connectionMode: Models.User.ClientTypes.WebsocketConnection,
            ...config
        };
    }

    private openListener: () => void = () => {};
    private messageListener: (event: MessageEvent<any>) => void = () => {};
    private errorListener: (e: Event) => void = () => {};
    private closeListener: () => void = () => {};

    private init() {
        this.ws = new WebSocket(this.url);
        this.ws.binaryType = "arraybuffer";
        const connectTimeout = setTimeout(() => {
            if (this.ws?.readyState !== WebSocket.OPEN && this.config.handshakeTimeout > 0) {
                this.ws?.close();
                this.ws = null;
            }
        }, this.config.handshakeTimeout);

        this.openListener = () => {
            clearTimeout(connectTimeout);
            this.emitter.emit("open");
        };
        this.ws.addEventListener("open", this.openListener);

        this.messageListener = event => {
            if (event.data instanceof ArrayBuffer) {
                try {
                    const packet = Packets.Packet.deserializeBinary(new Uint8Array(event.data));
                    this.emitter.emit("message", packet);
                } catch (error) {
                    this.emitter.emit("error", error);
                }
            } else {
                this.emitter.emit("error", "Warn: Received non-binary message");
            }
        };
        this.ws.addEventListener("message", this.messageListener);

        this.errorListener = e => {
            this.emitter.emit("error", e);
        };
        this.ws.addEventListener("error", this.errorListener);

        this.closeListener = () => {
            this.emitter.emit("disconnected");
            if (this.config.autoReconnect && !this.reconnectTimeout && this.reconnectAttempts <= this.config.autoReconnectMaxRetries) {
                this.ws?.removeEventListener("open", this.openListener);
                this.ws?.removeEventListener("message", this.messageListener);
                this.ws?.removeEventListener("error", this.errorListener);
                this.ws?.removeEventListener("close", this.closeListener);
                this.ws = null;
                this.reconnectTimeout = setTimeout(() => {
                    this.reconnectTimeout = null;
                    this.init();
                }, this.config.autoReconnectInterval);
                if (this.config.autoReconnectMaxRetries !== -1) this.reconnectAttempts++;
            }
        }
        this.ws.addEventListener("close", this.closeListener);
    }

    sendPacket(packet: Packets.Packet) {
        this.sendToSocket(packet.serializeBinary());
    }

    close(force: boolean = false) {
        if (force) return this.ws?.close();
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws?.close();
        }
    }
}
