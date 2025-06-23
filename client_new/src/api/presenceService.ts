import { generatePresenceWebsocketUrl } from "../config/api_url_config";

interface PresenceMessage {
    type: 'ELECT_LEADER' | 'LEADER_ELECTED' | 'HEARTBEAT' | 'WS_STATUS' | 'LOGOUT' | 'REQUEST_LEADER_STATUS';
    data?: {
        leaderId?: string;
        connected?: boolean;
        timestamp?: number;
    };
}

export class PresenceService {
    private static instance: PresenceService | null = null;
    private ws: WebSocket | null = null;
    private broadcastChannel: BroadcastChannel;
    private isLeader: boolean = false;
    private jwt: string | null = null;
    private readonly wsUrl: string = generatePresenceWebsocketUrl();
    private heartbeatInterval: number | null = null;
    private leaderCheckInterval: number | null = null;
    private readonly tabId: string;
    private currentLeaderId: string | null = null;

    private constructor() {
        this.tabId = this.generateUniqueTabId();
        this.broadcastChannel = new BroadcastChannel('presence_channel');
        this.setupBroadcastChannel();
        this.initLeaderElection();
        console.log(`PresenceService initialized for tab: ${this.tabId}`);
    }

    public static getInstance(): PresenceService {
        if (!PresenceService.instance) {
            PresenceService.instance = new PresenceService();
        }
        return PresenceService.instance;
    }

    private generateUniqueTabId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private setupBroadcastChannel(): void {
        this.broadcastChannel.onmessage = (event: MessageEvent<PresenceMessage>) => {
            // console.log(`Tab ${this.tabId} received BroadcastChannel message:`, event.data);
            switch (event.data.type) {
                case 'ELECT_LEADER':
                    // If a tab initiates an election, and we think we might be a leader, respond.
                    if (this.isLeader && this.currentLeaderId === this.tabId) {
                        this.broadcastChannel.postMessage({
                            type: 'LEADER_ELECTED',
                            data: { leaderId: this.tabId, timestamp: Date.now() }
                        });
                    }
                    break;
                case 'LEADER_ELECTED':
                    // A leader has been elected or re-affirmed.
                    const electedLeaderId = event.data.data?.leaderId;
                    const electedTimestamp = event.data.data?.timestamp;

                    if (electedLeaderId) {
                        // If the message is from a "newer" election or no leader is set, update.
                        // This helps in cases where multiple tabs might try to elect simultaneously.
                        const currentLeaderTimestamp = parseInt(localStorage.getItem('presence_leader_timestamp') || '0');
                        if (!this.currentLeaderId || (electedTimestamp && electedTimestamp > currentLeaderTimestamp)) {
                            this.currentLeaderId = electedLeaderId;
                            localStorage.setItem('presence_leader_id', electedLeaderId);
                            localStorage.setItem('presence_leader_timestamp', electedTimestamp!.toString());
                            this.isLeader = (this.currentLeaderId === this.tabId);
                            // console.log(`Tab ${this.tabId}: Leader elected/affirmed as ${this.currentLeaderId}. Am I leader? ${this.isLeader}`);
                            this.manageWebSocketConnection();
                        }
                    }
                    break;
                case 'HEARTBEAT':
                    // If we receive a heartbeat from the current leader, update its last seen time.
                    if (event.data.data?.leaderId === this.currentLeaderId) {
                        localStorage.setItem('presence_leader_heartbeat', Date.now().toString());
                    }
                    break;
                case 'WS_STATUS':
                    // If a non-leader tab receives WS_STATUS from the leader, ensure it's not trying to connect.
                    if (!this.isLeader && event.data.data?.connected) {
                        if (this.ws) {
                            console.log(`Tab ${this.tabId}: Received WS_STATUS connected from leader. Disconnecting my WS.`);
                            this.disconnectWebSocket(); // Ensure only the leader has an active WS
                        }
                    }
                    break;
                case 'LOGOUT':
                    // console.log(`Tab ${this.tabId}: Processing LOGOUT message`);
                    this.handleLogout();
                    break;
                case 'REQUEST_LEADER_STATUS':
                    // If a tab requests leader status, and we are the leader, respond.
                    if (this.isLeader && this.currentLeaderId === this.tabId) {
                        this.broadcastChannel.postMessage({
                            type: 'LEADER_ELECTED',
                            data: { leaderId: this.tabId, timestamp: Date.now() }
                        });
                    }
                    break;
            }
        };

        // On tab close, if this tab is the leader, proactively remove itself from localStorage.
        window.addEventListener('beforeunload', () => {
            if (this.isLeader && this.currentLeaderId === this.tabId) {
                // console.log(`Tab ${this.tabId}: Leader tab closing, proactively clearing leader info.`);
                localStorage.removeItem('presence_leader_id');
                localStorage.removeItem('presence_leader_timestamp');
                localStorage.removeItem('presence_leader_heartbeat');
                // Briefly inform other tabs that leader is gone, prompting re-election
                this.broadcastChannel.postMessage({ type: 'ELECT_LEADER' });
            }
            this.disconnectWebSocket(); // Ensure WebSocket is closed on unload for all tabs
        });
    }

    private initLeaderElection(): void {
        const storedLeaderId = localStorage.getItem('presence_leader_id');
        const storedLeaderTimestamp = parseInt(localStorage.getItem('presence_leader_timestamp') || '0');

        if (!storedLeaderId) {
            // No leader is set, attempt to become the leader.
            this.attemptToBecomeLeader();
        } else {
            this.currentLeaderId = storedLeaderId;
            this.isLeader = (this.currentLeaderId === this.tabId);
            // console.log(`Tab ${this.tabId}: Initial check. Stored leader: ${storedLeaderId}. Am I leader? ${this.isLeader}`);
            this.manageWebSocketConnection();
        }

        // Periodically check leader's heartbeat. If the leader is silent, trigger re-election.
        if (this.leaderCheckInterval) {
            clearInterval(this.leaderCheckInterval);
        }
        this.leaderCheckInterval = setInterval(() => {
            const lastHeartbeat = parseInt(localStorage.getItem('presence_leader_heartbeat') || '0');
            const leaderId = localStorage.getItem('presence_leader_id');

            // If we are the leader, we keep sending heartbeats.
            if (this.isLeader && this.currentLeaderId === this.tabId) {
                // console.log(`Tab ${this.tabId}: Sending leader heartbeat.`);
                localStorage.setItem('presence_leader_heartbeat', Date.now().toString());
                this.broadcastChannel.postMessage({
                    type: 'HEARTBEAT',
                    data: { leaderId: this.tabId }
                });
            } else if (leaderId && (Date.now() - lastHeartbeat > 10000)) { // 10 seconds without a heartbeat
                console.warn(`Tab ${this.tabId}: Leader (${leaderId}) seems to be unresponsive. Initiating re-election.`);
                localStorage.removeItem('presence_leader_id');
                localStorage.removeItem('presence_leader_timestamp');
                localStorage.removeItem('presence_leader_heartbeat');
                this.attemptToBecomeLeader();
            } else if (!leaderId) {
                // No leader is currently set, so attempt to become one.
                this.attemptToBecomeLeader();
            }
        }, 5000) as unknown as number; // Check every 5 seconds
    }

    private attemptToBecomeLeader(): void {
        // console.log(`Tab ${this.tabId}: Attempting to become leader.`);
        const now = Date.now();
        const storedLeaderId = localStorage.getItem('presence_leader_id');
        const storedLeaderTimestamp = parseInt(localStorage.getItem('presence_leader_timestamp') || '0');

        if (!storedLeaderId || now > storedLeaderTimestamp + 2000) { // If no leader, or leader info is stale (5s)
            localStorage.setItem('presence_leader_id', this.tabId);
            localStorage.setItem('presence_leader_timestamp', now.toString());
            localStorage.setItem('presence_leader_heartbeat', now.toString());
            this.currentLeaderId = this.tabId;
            this.isLeader = true;
            console.log(`Tab ${this.tabId}: Successfully became the leader!`);
            this.broadcastChannel.postMessage({
                type: 'LEADER_ELECTED',
                data: { leaderId: this.tabId, timestamp: now }
            });
            this.manageWebSocketConnection();
        } else {
            this.isLeader = false;
            this.currentLeaderId = storedLeaderId;
            // If another tab just became leader, request its status to confirm
            this.broadcastChannel.postMessage({ type: 'REQUEST_LEADER_STATUS' });
            this.manageWebSocketConnection();
        }
    }

    private manageWebSocketConnection(): void {
        if (this.isLeader) {
            if (!this.ws && this.jwt) {
                // console.log(`Tab ${this.tabId}: As leader, connecting WebSocket.`);
                this.connectWebSocket();
            } else if (this.ws && this.ws.readyState !== WebSocket.OPEN && this.jwt) {
                // console.log(`Tab ${this.tabId}: As leader, WebSocket not open, attempting reconnect.`);
                this.connectWebSocket();
            }
        } else {
            if (this.ws) {
                // console.log(`Tab ${this.tabId}: Not leader, disconnecting WebSocket.`);
                this.disconnectWebSocket();
            }
        }
    }

    private startHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.heartbeatInterval = setInterval(() => {
            if (this.isLeader && this.ws && this.ws.readyState === WebSocket.OPEN) {
                const heartbeatMessage = {
                    protocol: 'heartbeat',
                    action: 'keepAlive',
                    message: 'ping'
                };
                try {
                    // console.log('Sending heartbeat:', heartbeatMessage);
                    this.ws.send(JSON.stringify(heartbeatMessage));
                } catch (error) {
                    console.error('Failed to send heartbeat:', error);
                }
            }
        }, 15000) as unknown as number; // 15 seconds
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            // console.log('Stopping heartbeat');
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private connectWebSocket(): void {
        if (!this.jwt) {
            // console.log('No JWT provided, cannot connect WebSocket');
            return;
        }
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            // console.log('WebSocket already connected or connecting.');
            return;
        }

        try {
            this.ws = new WebSocket(`${this.wsUrl}?playerJWT=${this.jwt}`);

            this.ws.onopen = () => {
                // console.log(`Tab ${this.tabId}: WebSocket connected.`);
                if (this.isLeader) {
                    this.startHeartbeat();
                    this.broadcastChannel.postMessage({
                        type: 'WS_STATUS',
                        data: { connected: true }
                    });
                }
            };

            this.ws.onclose = () => {
                // console.log(`Tab ${this.tabId}: WebSocket disconnected.`);
                this.stopHeartbeat();
                this.ws = null;
                if (this.isLeader) {
                    this.broadcastChannel.postMessage({
                        type: 'WS_STATUS',
                        data: { connected: false }
                    });
                    // If leader's WS closes unexpectedly, try to reconnect.
                    setTimeout(() => this.manageWebSocketConnection(), 3000);
                }
            };

            this.ws.onerror = (error) => {
                console.error(`Tab ${this.tabId}: WebSocket error:`, error);
            };
        } catch (error) {
            console.error(`Tab ${this.tabId}: Failed to connect WebSocket:`, error);
            this.ws = null;
        }
    }

    private disconnectWebSocket(): void {
        if (this.ws) {
            this.stopHeartbeat();
            this.ws.close();
            this.ws = null;
            // console.log(`Tab ${this.tabId}: Disconnected WebSocket.`);
        }
    }

    public init(jwt: string | null): void {
        // console.log(`Tab ${this.tabId}: Initializing PresenceService with JWT.`);
        this.jwt = jwt;
        this.manageWebSocketConnection();
    }

    public onLogin(jwt: string): void {
        // console.log(`Tab ${this.tabId}: onLogin called. JWT present.`);
        this.jwt = jwt;
        this.manageWebSocketConnection();
        // After login, re-affirm or initiate leader election in case of stale state
        this.broadcastChannel.postMessage({ type: 'ELECT_LEADER' });
    }

    public onLogout(): void {
        // console.log(`Tab ${this.tabId}: onLogout called, broadcasting LOGOUT`);
        this.broadcastChannel.postMessage({ type: 'LOGOUT' });
        this.handleLogout(); // Handle logout in this tab
    }

    private handleLogout(): void {
        // console.log(`Tab ${this.tabId}: Handling logout.`);
        this.jwt = null;
        this.disconnectWebSocket();
        if (this.isLeader) {
            // If the leader logs out, relinquish leadership
            localStorage.removeItem('presence_leader_id');
            localStorage.removeItem('presence_leader_timestamp');
            localStorage.removeItem('presence_leader_heartbeat');
            this.isLeader = false;
            this.currentLeaderId = null;
            this.broadcastChannel.postMessage({ type: 'ELECT_LEADER' }); // Prompt re-election
        }
    }
}