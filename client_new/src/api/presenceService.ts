import {generatePresenceWebsocketUrl} from "../config/api_url_config";

interface PresenceMessage {
    type: 'OPEN_WS' | 'CLOSE_WS' | 'WS_STATUS' | 'LOGOUT';
    data?: any;
}

export class PresenceService {
    private static instance: PresenceService | null = null;
    private ws: WebSocket | null = null;
    private broadcastChannel: BroadcastChannel;
    private isLeader: boolean = false;
    private jwt: string | null = null;
    private readonly wsUrl: string = generatePresenceWebsocketUrl();

    private constructor() {
        this.broadcastChannel = new BroadcastChannel('presence_channel');
        this.setupBroadcastChannel();
        this.checkLeaderStatus();
    }

    public static getInstance(): PresenceService {
        if (!PresenceService.instance) {
            PresenceService.instance = new PresenceService();
        }
        return PresenceService.instance;
    }

    private setupBroadcastChannel(): void {
        this.broadcastChannel.onmessage = (event: MessageEvent<PresenceMessage>) => {
            console.log('BroadcastChannel received:', event.data);
            switch (event.data.type) {
                case 'OPEN_WS':
                    console.log('Processing OPEN_WS from another tab');
                    if (this.isLeader && !this.ws) {
                        this.connectWebSocket();
                    }
                    break;
                case 'CLOSE_WS':
                    if (this.isLeader && this.ws) {
                        this.disconnectWebSocket();
                    }
                    break;
                case 'WS_STATUS':
                    if (!this.isLeader && event.data.data?.connected) {
                        // WebSocket is open in another tab
                        this.ws = null;
                    }
                    break;
                case 'LOGOUT':
                    console.log('Processing LOGOUT message');
                    this.handleLogout();
                    break;
            }
        };

        // Notify other tabs when this tab is closing
        window.addEventListener('beforeunload', () => {
            if (this.isLeader && this.ws) {
                this.broadcastChannel.postMessage({ type: 'CLOSE_WS' });
            }
        });
    }

    private checkLeaderStatus(): void {
        console.log('Checking leader status. presence_leader:', localStorage.getItem('presence_leader'));
        this.isLeader = !localStorage.getItem('presence_leader');
        console.log('isLeader set to:', this.isLeader);
        if (this.isLeader) {
            localStorage.setItem('presence_leader', 'true');
            window.addEventListener('beforeunload', () => {
                console.log('Leader tab closing, removing presence_leader');
                localStorage.removeItem('presence_leader');
            });
        }

        // Periodically broadcast WebSocket status
        setInterval(() => {
            if (this.isLeader) {
                this.broadcastChannel.postMessage({
                    type: 'WS_STATUS',
                    data: { connected: this.ws?.readyState === WebSocket.OPEN }
                });
            }
        }, 5000);
    }

    private connectWebSocket(): void {
        if (!this.jwt) {
            console.log('No JWT provided, cannot connect WebSocket');
            return;
        }

        try {
            this.ws = new WebSocket(`${this.wsUrl}?playerJWT=${this.jwt}`);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.broadcastChannel.postMessage({
                    type: 'WS_STATUS',
                    data: { connected: true }
                });
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.ws = null;
                this.broadcastChannel.postMessage({
                    type: 'WS_STATUS',
                    data: { connected: false }
                });
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }

    private disconnectWebSocket(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public init(jwt: string | null): void {
        console.log('Initializing PresenceService with JWT:', jwt);
        this.jwt = jwt;
        if (this.jwt && this.isLeader && !this.ws) {
            console.log('Leader tab initializing WebSocket');
            this.connectWebSocket();
            this.broadcastChannel.postMessage({ type: 'OPEN_WS' }); // Notify other tabs
        }
    }

    public onLogin(jwt: string): void {
        console.log('onLogin called. isLeader:', this.isLeader, 'ws:', this.ws, 'jwt:', jwt);
        this.jwt = jwt;
        if (this.isLeader && !this.ws) {
            console.log('Leader tab opening WebSocket');
            this.connectWebSocket(); // Call directly in the leader tab
            this.broadcastChannel.postMessage({ type: 'OPEN_WS' }); // Notify other tabs
        }
    }

    public onLogout(): void {
        console.log('onLogout called, broadcasting LOGOUT');
        this.broadcastChannel.postMessage({ type: 'LOGOUT' });
        this.handleLogout(); // Handle logout in this tab
    }

    private handleLogout(): void {
        console.log('Handling logout in tab. isLeader:', this.isLeader);
        this.jwt = null;
        if (this.isLeader && this.ws) {
            this.disconnectWebSocket();
        }
    }
}