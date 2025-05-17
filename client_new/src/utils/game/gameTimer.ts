import { gameTimerId } from "../../components/utils/game/renderHtmlGameLayout";

export class GameTimer {
    private displayElement: HTMLDivElement;
    private startTimestamp: number | null = null;
    private elapsedMs: number = 0;
    private running: boolean = false;
    private rafId: number | null = null;

    constructor(displayElement: HTMLDivElement) {
        this.displayElement = displayElement;
    }

    public start(): void {
        if (this.running) return;
        this.running = true;
        this.startTimestamp = performance.now();
        this.update();
    }

    public pause(): void {
        if (!this.running || this.startTimestamp === null) return;
        this.running = false;
        this.elapsedMs += performance.now() - this.startTimestamp;
        cancelAnimationFrame(this.rafId!);
    }

    public reset(): void {
        this.running = false;
        this.startTimestamp = null;
        this.elapsedMs = 0;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.render(0);
    }

    public stop(): void {
        this.pause();
    }

    public getTime(): number {
        if (this.running && this.startTimestamp !== null) {
            return this.elapsedMs + (performance.now() - this.startTimestamp);
        }
        return this.elapsedMs;
    }

    private update = (): void => {
        this.render(this.getTime());
        if (this.running) {
            this.rafId = requestAnimationFrame(this.update);
        }
    };

    private render(ms: number): void {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.displayElement.textContent =
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    }
}


