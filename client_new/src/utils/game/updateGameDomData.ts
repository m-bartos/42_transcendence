import {
    player1ScoreId,
    player2ScoreId,
    player1UsernameId,
    player2UsernameId,
    player1AvatarId, player2AvatarId
} from "../../components/utils/game/renderHtmlGameLayout";
import { getUserInfo } from "../../api/getUserInfo";
import {generateStaticDataUrl} from "../../config/api_url_config";

interface Ball {
    x: number;
    y: number;
    semidiameter: number;
}

interface Players {
    playerId: string;
    username: string;
    avatar: string;
    score: number;
    paddleBounce: number;
}

interface GameData {
    status: string;
    ball: Ball;
    paddles: [];
    players: Players[];
    timestamp: number;
}


export function updateScore(gameData: GameData) {
    const player1Score = document.getElementById(player1ScoreId)!;
    const player2Score = document.getElementById(player2ScoreId)!;
    if (gameData.players) {
        player1Score.textContent=gameData.players[0].score.toString();
        player2Score.textContent=gameData.players[1].score.toString();

    }
}

export function updateUsername(gameData: GameData) {
    const player1Username = document.getElementById(player1UsernameId)!;
    const player2Username = document.getElementById(player2UsernameId)!;
    if (gameData.players) {
        player1Username.textContent=gameData.players[0].username.toUpperCase();
        player2Username.textContent=gameData.players[1].username.toUpperCase();
    }
}

export function updateLoggedInUserInfo() {
    console.log("updateLoggedInUserInfo");
    let username = localStorage.getItem('username');
    let avatar = localStorage.getItem('avatar');
    const player1Username = document.getElementById(player1UsernameId) as HTMLDivElement;
    const player1Avatar = document.getElementById(player1AvatarId) as HTMLImageElement;
    if (username && avatar) {
        player1Username.textContent = username.toUpperCase();
        player1Avatar.src = generateStaticDataUrl(avatar);
        console.log(player1Avatar.textContent);
    }
    else {
        getUserInfo()
            .then((data) => {
                username = localStorage.getItem('username');
                avatar = localStorage.getItem('avatar');
                player1Username.textContent = username!.toUpperCase();
                player1Avatar.src = generateStaticDataUrl(avatar!);
                console.log(avatar);
            })
            .catch((error) => {
                throw error;
            })
    }
}

export function updateAvatarLink(gameData: GameData) {
    const player1Avatar = document.getElementById(player1AvatarId)!;
    const player2Avatar = document.getElementById(player2AvatarId)!;
    for (const player of gameData.players) {
        if (player.avatar)
        {
            player1Avatar.textContent=player.avatar
            player2Avatar.textContent=player.avatar
        }
    }
}

