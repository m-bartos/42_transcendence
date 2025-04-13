// handlers/ProtocolHandler.ts
import type { Router } from "../router.js";
import type { MessageObject, PayloadType } from "../types.js";
import storage from "../userSessionStorage.js";

export abstract class ProtocolHandler<T extends PayloadType = PayloadType> {
    protected router: Router;
    protected storage = storage;

    constructor(router: Router) {
        this.router = router;
        this.router.on(this.protocolName(), this.handleMessage.bind(this));
    }

    abstract protocolName(): string;

    abstract handleMessage(message: MessageObject<T>): void;
}
