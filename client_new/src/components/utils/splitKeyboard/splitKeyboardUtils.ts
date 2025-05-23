import { validatePlayerNames } from "../security/securityUtils";
import Navigo from "navigo";
import { home_page_url } from "../../../config/api_url_config";


export interface GameSettings  {
    background: string;
    paddle: string;
    ball: string;
    player1: string;
    player2: string;
};

const colors = ['#000000', '#FFFFFF', '#cd0000', '#006b3c', '#60a5fa', '#fbbf24']; // černá bílá červená, zelená, modrá, žlutá

export function renderSplitKeyboardContent(router: Navigo): void {
    //nejdrive nacteme a zkontrolujeme vsechny elementy
    const canvas = document.getElementById('colorCanvas') as HTMLCanvasElement;
    const bgColorRow = document.getElementById('bg-color-row') as HTMLDivElement;
    const paddleColorRow = document.getElementById('paddle-color-row') as HTMLDivElement;
    const ballColorRow = document.getElementById('ball-color-row')  as HTMLDivElement;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLButtonElement;
    const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement;
    const player1NameInput = document.getElementById('player1Name') as HTMLInputElement;
    const player2NameInput = document.getElementById('player2Name') as HTMLInputElement;

    
    if(!canvas || !bgColorRow || !paddleColorRow || !ballColorRow || !confirmBtn || !cancelBtn || !player1NameInput || !player2NameInput) {
        console.error('One or more elements not found');
        return;
    };
    //vutvorime promenne pro vykresleni canvasu
    
    const ctx = canvas.getContext('2d')!;
    const paddleHeight = canvas.height / 4;
    const paddleWidth = 5;
    const ballRadius = 10;
    //nastavime vychozi hodnoty pro barvy a jmena hracu
    let game: GameSettings = {
        background: colors[1],
        paddle: colors[0],
        ball: colors[2],
        player1: 'Player 1',
        player2: 'Player 2'
    };

    //pokusime se druhemu hraci priradit jmeno prihlaseneho hrace (ALE TO JE VLASTNE BLBOST....)
    // const userJson = localStorage.getItem('user');
    // const user = userJson ? JSON.parse(userJson) : null;    
    // if(user) {
    //     player2NameInput.value = user.username;
    //     console.log(`usersname: ${user.username}`);
    //     player2NameInput.placeholder = user.username;
    // }
    // else console.error('user is null');

    //prekreslime canvas pri zmene velikosti okna
    window.onresize = () => {
        if(window.innerWidth < 640) {
            canvas.width = 400;
            canvas.height = 200;
        }
        else {
            canvas.width = 500;
            canvas.height = 250;
        }
        drawCanvas();
    }

    // Vykresli canvas s aktuálními barvami
    function drawCanvas() {
        // Pozadí
        ctx.fillStyle = game.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Palka 1
        ctx.fillStyle = game.paddle;
        ctx.fillRect(0, (canvas.height /2 ) - (paddleHeight / 2), paddleWidth, paddleHeight);

        // Palka 2
        ctx.fillStyle = game.paddle;
        ctx.fillRect(canvas.width - 5, (canvas.height /2 ) - (paddleHeight / 2), paddleWidth, paddleHeight);

        // Kulička
        ctx.fillStyle = game.ball;
        ctx.beginPath();
        ctx.arc(canvas.width/2 - 5,canvas.height/2 - 5, ballRadius, 0,2*Math.PI);
        ctx.fill();
    }

    // Vytvoř kruh pro barvu
    function createColorCircle(color: string, addColor: () => void): HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'w-12 h-12 rounded-full cursor-pointer border-2 border-gray-100 hover:ring-2 ring-offset-2';
        div.style.backgroundColor = color;
        div.onclick = () => {
            addColor();
            drawCanvas();
        };
        return div;
    };

    // Inicializace barevných kruhů
    colors.forEach(color => {
        const bgCircle = createColorCircle(color, () => game.background = color);
        const paddleCircle = createColorCircle(color, () => game.paddle = color);
        const ballCircle = createColorCircle(color, () => game.ball = color);
        bgColorRow.append(bgCircle);
        paddleColorRow.append(paddleCircle);
        ballColorRow.append(ballCircle);
    });
    //prvni vykresleni canvasu
    drawCanvas();

    // Confirm button 
    function handleConfirm(game: { background: string; paddle: string; ball: string, player1: string, player2: string }) {
        console.log('Confirmed game:', game);
    }

    confirmBtn.addEventListener('click', () => {
        if (player1NameInput.value.trim() !== '') {
            game.player1 = player1NameInput.value.trim();
        }
        if (player2NameInput.value.trim() !== '') {
            game.player2 = player2NameInput.value.trim();
        }
        if(validatePlayerNames(game)) {
            player1NameInput.value = '';
            player2NameInput.value = '';
            handleConfirm({
                background: game.background,
                paddle: game.paddle,
                ball: game.ball,
                player1: game.player1,
                player2: game.player2
            });
        }
        else {
            return;
        }
        //TO-DO Zpracovat Start hry na split Keyboard!!!!!!!!!!!!!!!!!!!!
    });

    // CancelButton
    cancelBtn.addEventListener('click', () => {
        router.navigate(home_page_url);
    });
};