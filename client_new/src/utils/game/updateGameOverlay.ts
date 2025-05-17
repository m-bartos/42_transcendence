import {
    overlayPlayer1UsernameId,
    overlayPlayer1ScoreId,
    overlayPlayer1BouncesId,
    overlayPlayer1WinnerId,
    overlayPlayer2UsernameId,
    overlayPlayer2ScoreId,
    overlayPlayer2BouncesId,
    overlayPlayer2WinnerId,
    gameOverlayId,
} from "../../components/utils/game/renderHtmlGameLayout";

import { WsGame, WsDataEnded } from "../../types/game";


export function updateGameOverlay(gameData: WsGame)
{
    const gameOverlay = document.getElementById(gameOverlayId) as HTMLDivElement | null;
    if (!gameOverlay) return;

    const data = gameData.data as WsDataEnded;
    // Player 1
    const player1Username = document.getElementById(overlayPlayer1UsernameId) as HTMLTableCellElement | null;
    const player1Score    = document.getElementById(overlayPlayer1ScoreId) as HTMLTableCellElement | null;
    const player1Bounces  = document.getElementById(overlayPlayer1BouncesId) as HTMLTableCellElement | null;
    const player1Winner   = document.getElementById(overlayPlayer1WinnerId) as HTMLTableCellElement | null;

    // Player 2
    const player2Username = document.getElementById(overlayPlayer2UsernameId) as HTMLTableCellElement | null;
    const player2Score    = document.getElementById(overlayPlayer2ScoreId) as HTMLTableCellElement | null;
    const player2Bounces  = document.getElementById(overlayPlayer2BouncesId) as HTMLTableCellElement | null;
    const player2Winner   = document.getElementById(overlayPlayer2WinnerId) as HTMLTableCellElement | null;

    if (
        !player1Username || !player1Score || !player1Bounces || !player1Winner ||
        !player2Username || !player2Score || !player2Bounces || !player2Winner
    ) {
        console.error('One or more overlay elements not found.');
        return;
    }

    player1Username.textContent = data.players[0].username!.toUpperCase();
    player1Score.textContent    = data.players[0].score.toString();
    player1Bounces.textContent  = data.players[0].paddleBounce.toString();
    player1Winner.textContent   = data.players[0].id === data.winnerId ? '✔' : '—';

    player2Username.textContent = data.players[1].username!.toUpperCase();
    player2Score.textContent    = data.players[1].score.toString();
    player2Bounces.textContent  = data.players[1].paddleBounce.toString();
    player2Winner.textContent   = data.players[1].id === data.winnerId ? '✔' : '—';
    gameOverlay.classList.remove('hidden');
}
