export class WebSocketHandler extends EventTarget {
    gameSocket: WebSocket | null;
    data: object = {};

    constructor(webSocketUrl: string) {
        super();
        this.gameSocket = new WebSocket(webSocketUrl);

        this.gameSocket.onmessage = (event) => {
            this.data = JSON.parse(event.data);
            this.dispatchEvent(new CustomEvent('gameData', {
                detail: this.data
            }));
        };

        this.gameSocket.onerror = () => {
            this.data = { status: 'error' };
            this.dispatchEvent(new CustomEvent('error', {
                detail: this.data
            }));
        };

        this.gameSocket.onclose = () => {
            this.data = { status: 'close' };
            this.dispatchEvent(new CustomEvent('close', {
                detail: this.data
            }));
        };
    }

    fetchGameData() {
        this.dispatchEvent(new CustomEvent('fetchGameData', {
            detail: this.data
        }));
    }

    closeWebsocket() {
        if (this.gameSocket && this.gameSocket.readyState === WebSocket.OPEN)
        {
            this.gameSocket?.close();
        }
    }

    sendMessage(message: string): void {
        if (this.gameSocket && this.gameSocket.readyState === WebSocket.OPEN)
        {
            this.gameSocket?.send(message);
        }
    }
}
