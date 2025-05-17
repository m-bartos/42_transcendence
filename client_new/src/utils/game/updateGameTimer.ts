import { GameTimer} from "./gameTimer";

export function recordGameTime(state: 'live' | 'paused' | 'ended' | 'reset', timer: GameTimer): void {
    if (state === 'live') timer.start();
    if (state === 'paused') timer.pause();
    if (state === 'ended') timer.stop();
    if (state === 'reset') timer.reset();
}