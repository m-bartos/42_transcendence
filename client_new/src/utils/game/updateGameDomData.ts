import {
    player1ScoreId,
    player2ScoreId,
    player1UsernameId,
    player2UsernameId,
    player1AvatarId, player2AvatarId
} from "../../components/utils/game/renderHtmlGameLayout";
import {getAvatar, getUserInfo} from "../../api/getUserInfo";
import {generateStaticDataUrl} from "../../config/api_url_config";

import {WsDataLive, WsGame, WsDataCountdown, PlayerState, WsDataOpponentFound} from "../../types/multiplayer-game";


export function updateScore(gameData: WsDataLive) {
    const player1Score = document.getElementById(player1ScoreId)!;
    const player2Score = document.getElementById(player2ScoreId)!;
    if (gameData.players) {
        player1Score.textContent=gameData.players[0].score.toString();
        player2Score.textContent=gameData.players[1].score.toString();

    }
}

export function updateUsername(players: PlayerState[]) {
    const player1Username = document.getElementById(player1UsernameId) as HTMLSpanElement;
    const player2Username = document.getElementById(player2UsernameId) as HTMLSpanElement
    if (players) {
        if (players[0].username) {
            player1Username.textContent = players[0].username.toUpperCase();
        }
        else {
            player1Username.textContent="Unknown Player 1";
        }
        if (players[1].username) {
            player2Username.textContent = players[1].username.toUpperCase();
        }
        else {
            player2Username.textContent="Unknown Player 2";
        }
    }
}

export function updateAvatar(gameData: WsDataOpponentFound) {
    const player1avatar = document.getElementById(player1AvatarId) as HTMLSpanElement;
    const player2avatar = document.getElementById(player2AvatarId) as HTMLSpanElement;
    if (gameData.players && player1avatar && player2avatar) {
        player1avatar.setAttribute('src', getAvatar(gameData.players[0].avatar!))
        player2avatar.setAttribute('src', getAvatar(gameData.players[1].avatar!))
    }
}

// Not needed as the server will push all relevant player information
export function updateLoggedInUserInfo() {
    let username = localStorage.getItem('username');
    let avatar = localStorage.getItem('avatar');
    const player1Username = document.getElementById(player1UsernameId) as HTMLDivElement;
    const player1Avatar = document.getElementById(player1AvatarId) as HTMLImageElement;
    if (username && avatar) {
        player1Username.textContent = username.toUpperCase();
        player1Avatar.src = generateStaticDataUrl(avatar);
    }
    else {
        getUserInfo()
            .then((data) => {
                username = localStorage.getItem('username');
                avatar = localStorage.getItem('avatar');
                player1Username.textContent = username!.toUpperCase();
                player1Avatar.src = generateStaticDataUrl(avatar!);
            })
            .catch((error) => {
                throw error;
            })
    }
}


