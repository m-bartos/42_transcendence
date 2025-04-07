import { scoreBoard } from './scoreBoard.js';
export function renderCanvas(gameId : string | number |null) : HTMLDivElement {
    
    const canvasContainer = document.createElement('div');
    canvasContainer.className = ' relative min-w-2xl container mx-auto w-full justify-start';
    //canvasContainer.className = 'relative aspect-video w-full max-w-3xl mx-auto bg-gray-200';
    canvasContainer.style.height = '75vh';
    //canvasContainer.style.padding-top = '56.25%';

    
    const scoreElement = document.createElement('div');
    scoreElement.className = ' relative grid grid-cols-3 gap-4 rounded-md bg-gray-600 mb-2 text-center text-white text-2xl';
    scoreElement.style.fontSize = '2em';
    scoreElement.style.zIndex = '100';
    //scoreElement.style.top = '-50px';
    scoreElement.textContent = 'Score: 0';
    scoreElement.innerHTML = scoreBoard;
    
    const gameCanvas = document.createElement('canvas');
    gameCanvas.className = 'relative bg-gray-400 rounded-sm border-2 border-gray-500';
    console.log("canvas created");

    const countDownElement = document.createElement('div');
    countDownElement.className = 'hidden absolute z-100 px-10 py-6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl text-white bg-graz-800 rounded-md';
    countDownElement.id = 'countdown';
    countDownElement.textContent = '';


    // document.getElementById('app')?.appendChild(scoreElement);
    // document.getElementById('app')?.appendChild(countDownElement);
    canvasContainer.appendChild(scoreElement);
    canvasContainer.appendChild(countDownElement);
    canvasContainer.appendChild(gameCanvas);


    
    
    //canvasContainer.appendChild(gameCanvas);
    
    // gameCanvas.style.top = '150px';
    // gameCanvas.style.left = ((window.innerWidth - gameCanvas.width) / 2).toString() + 'px';
    
    const ctx = gameCanvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas not supported');
        return canvasContainer;
    }
    gameCanvas.width = canvasContainer.offsetWidth;
    //gameCanvas.height = canvasContainer.offsetHeight;
    gameCanvas.height = gameCanvas.width * 1/2;
    console.log('Canvas size:', gameCanvas.width, gameCanvas.height);

    const player1Name = scoreElement.querySelector('#player1') as HTMLDivElement;
    const player2Name = scoreElement.querySelector('#player2') as HTMLDivElement;
    const score1 = scoreElement.querySelector('#score1') as HTMLDivElement;
    const score2 = scoreElement.querySelector('#score2') as HTMLDivElement;
    
    
    const settingsElement = document.getElementById('gameSettings') as HTMLDivElement;
    const gameContainer = document.getElementById('gameContainer') as HTMLDivElement;
    
    let gameSocket : WebSocket | null = null;
    const token = localStorage.getItem('jwt_token');
    const paddleSpeed : number = 50;
    let gameState: any = null;
    let prevMessage: any = null;
    let currentMessage: any = null;
    let ballStartX: number = 0;
    let ballStartY: number = 0;
    let ballTargetX: number = 0;
    let ballTargetY: number = 0;
    let animationStartTime: number | null = null;
    let animationDuration: number = 1000;
    let direction : number = 0;
    let backgroundColor : string = 'rgb(74, 85, 101)';
    let paddleColor : string = 'rgb(255, 255, 255)';
    let ballColor : string = 'rgb(255, 0, 0)';

    document.addEventListener('mouseup', handleMouseClick)

    function handleMouseClick(event: MouseEvent): void {
        if(gameCanvas){
            if(event.target != gameCanvas){
                console.log('Clicked : ' , event.target);
                closeGame();
            }
        }
    }

    function resizeCanvas() {
        gameCanvas.width = canvasContainer.clientWidth;
        //gameCanvas.height = canvasContainer.offsetHeight;
        gameCanvas.height = gameCanvas.width * 1/2;
        requestAnimationFrame(drawGame);
    }
    
    window.addEventListener("resize", resizeCanvas);
    

    function openGameSocket(gameId: string | number | null, playerJWT: string): void {
        if (gameSocket) gameSocket.close();
        gameSocket = new WebSocket(`ws://localhost/api/game/ws/${gameId}?playerJWT=${playerJWT}`);
        //console.log('Game socket:', gameSocket);
        gameSocket.onerror = (error) => {
            console.error('Socket error: ', error);
        }
        gameSocket.onclose = () => {
            console.log('Game socket closed');
            gameContainer.classList.toggle('shadow-md');            
        }   
        if(!gameSocket) {
            console.error('No game socket');
        }
        else {
            setupGameSocket();
        }
    }
    
    function setupGameSocket() : void {
        if(!gameSocket) return;
        gameSocket.onmessage = (event) => {
            const newState = JSON.parse(event.data);
            //console.log('New state:', newState);
            if (!newState.timestamp) {
                console.error('No timestamp in message');
                return;
            }
            prevMessage = currentMessage;
            currentMessage = newState;

            if (prevMessage && currentMessage) {
                ballStartX = scaleX(prevMessage.ball.x);
                ballStartY = scaleY(prevMessage.ball.y);
                ballTargetX = scaleX(currentMessage.ball.x);
                ballTargetY = scaleY(currentMessage.ball.y);
                animationDuration = currentMessage.timestamp - prevMessage.timestamp;
                animationStartTime = performance.now();
            } else if (currentMessage) {
                ballStartX = scaleX(currentMessage.ball.x);
                ballStartY = scaleY(currentMessage.ball.y);
                ballTargetX = ballStartX;
                ballTargetY = ballStartY;
            }
            gameState = newState;
            updatePlayerNames();

            if (gameState.status === 'ended') {
               showWinner();
            }

            if (gameState.status === 'countdown') {
                showCountdown(gameState.countdown);
            } else {
                if(!countDownElement.classList.contains('hidden')){
                    countDownElement.classList.add('hidden');
                }
            }
        }
        gameSocket.onopen = () => {
            resizeCanvas();
            animate();
        }
    }

    openGameSocket(gameId, token!);

    
    function drawGame(): void {
        if (!gameState || !ctx) return;
      
        // Clear canvas
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
      
        // Draw center dashed line
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(gameCanvas.width / 2, 0);
        ctx.lineTo(gameCanvas.width / 2, gameCanvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
      
        // Draw paddles
        ctx.fillStyle = paddleColor;
        ctx.fillRect(
          scaleX(0),
          scaleY(gameState.playerOne.paddle.yCenter - gameState.playerOne.paddle.height / 2),
          scaleX(gameState.playerOne.paddle.width),
          scaleY(gameState.playerOne.paddle.height)
        );
      
        ctx.fillRect(
          scaleX(100 - gameState.playerTwo.paddle.width),
          scaleY(gameState.playerTwo.paddle.yCenter - gameState.playerTwo.paddle.height / 2),
          scaleX(gameState.playerTwo.paddle.width),
          scaleY(gameState.playerTwo.paddle.height)
        );
      
        // Animate ball movement
        let ballX: number, ballY: number;
        if (animationStartTime !== null && animationDuration > 0) {
          const currentTime = performance.now();
          let progress = (currentTime - animationStartTime) / animationDuration;
          progress = Math.min(1, Math.max(0, progress));
          ballX = ballStartX + (ballTargetX - ballStartX) * progress;
          ballY = ballStartY + (ballTargetY - ballStartY) * progress;
        } else {
          ballX = ballTargetX;
          ballY = ballTargetY;
        }
      
        ctx.beginPath();
        ctx.arc(ballX, ballY, scaleX(gameState.ball.semidiameter), 0, Math.PI * 2);
        ctx.fillStyle = ballColor;
        ctx.fill();
    }

    function scaleX(x: number): number {
        return (x / 100) * gameCanvas.width;
    }
      
    function scaleY(y: number): number {
        return (y / 100) * gameCanvas.height;
    }
    
    function showCountdown(count?: number): void {
        if (count === undefined) return;
        countDownElement.textContent = count > 0 ? count.toString() : 'Go!';
        countDownElement.classList.remove('hidden');
        if (count === 0) {
          setTimeout(() => {
            countDownElement.classList.add('hidden');;
          }, 500);
        }
    }

    function showWinner(): void {
        const winnerElement = document.createElement('div') as HTMLDivElement;
        winnerElement.className = 'hidden sm:block absolute z-100 p-6 top-50 left-1/2  items-center transform -translate-x-1/2 -translate-y-1/2 rounded-md ';
        var elem = document.createElement("img") as HTMLImageElement;
        elem.setAttribute("src", "./src/assets/images/clip-excited-person-gif-31.gif");
        elem.setAttribute("height", "200");
        elem.setAttribute("width", "200");
        winnerElement.appendChild(elem);
        const resultSign = document.createElement('span');
        resultSign.className = 'text-4xl text-amber-500 font-bold capitalize';
        if (gameState.playerOne.score > gameState.playerTwo.score) {
            resultSign.textContent = `${gameState.playerOne.username} WINS!`;
        } else if (gameState.playerOne.score < gameState.playerTwo.score) {
            resultSign.textContent = `${gameState.playerTwo.username} WINS!`;
        } else {
            resultSign.textContent = 'DRAW!';
        }
        winnerElement.appendChild(resultSign);
        scoreElement.appendChild(winnerElement);
        setTimeout(() => { 
            closeGame();
        } , 3000);
    }

    function updatePlayerNames(): void {
        if (!gameState) return;
        player1Name.textContent = gameState.playerOne.username;
        player2Name.textContent = gameState.playerTwo.username;
        score1.textContent = gameState.playerOne.score.toString();
        score2.textContent = gameState.playerTwo.score.toString();
    }
    //-------------------------------------------------------------------------------------------------------------
    // document.addEventListener('keydown', (event: KeyboardEvent) => {
    //     //if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;
      
    //     //let direction = 0;
    //     event.preventDefault();
    //     if (event.key === 'ArrowUp') direction = -1;
    //     else if (event.key === 'ArrowDown') direction = 1;
      
    //     // if (direction !== 0 && gameState.status === 'live') {
    //     //     gameSocket.send(JSON.stringify({ type: 'movePaddle', direction }));
    //     // }
    // });

    // document.addEventListener('keyup', (event: KeyboardEvent) => {
    //     if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    //         direction = 0;
    //     }
    // });

    // function sendGameSettings(): void {
    //     if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;
    //     if(direction !== 0)
    //         gameSocket.send(JSON.stringify({ type: 'movePaddle', direction }));
    // }

    // setInterval(() => {
    //     sendGameSettings();
    // }, paddleSpeed);
    //----------------------------------------------------------------------------------------------------------------------
    let keysPressed = { ArrowUp: false, ArrowDown: false };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    function handleKeyDown(event: KeyboardEvent):void {
        console.log('Key pressed:', event.key);
        if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            keysPressed[event.key] = true; // Mark the key as pressed
            sendPaddleDirection();
        }
    };

    function handleKeyUp(event: KeyboardEvent):void {
        if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            keysPressed[event.key] = false; // Mark the key as released
            sendPaddleDirection();
        }
    }


    function sendPaddleDirection() : void {
        console.log('Sending paddle direction');
        let direction = 0;
        if (keysPressed.ArrowUp && !keysPressed.ArrowDown) direction = -1;
        else if (keysPressed.ArrowDown && !keysPressed.ArrowUp) direction = 1;
        // If both or neither are pressed, direction remains 0

        if (gameState.status === 'live' && gameSocket) {
            gameSocket.send(JSON.stringify({ type: 'movePaddle', direction }));
        }
    }


    //-------------------------------------------------------------------------------------------------------------------------


    function animate(): void {
        drawGame();
        requestAnimationFrame(animate);
    }
    window.addEventListener('popstate', listener);
    if(PopStateEvent) console.log('PopStateEvent');

    function listener() {
        if (gameSocket) {
            gameSocket.close();
            gameSocket = null;
        }
    }

    function closeGame() {
        if (gameSocket) {
            canvasContainer.remove();
            settingsElement.classList.remove('hidden');
            gameSocket?.close();
            document.removeEventListener('mouseup', handleMouseClick )
        }
    }
    // const pushUrl = (href) => {
    // history.pushState({}, '', href);
    // window.dispatchEvent(new Event('popstate'));
    // };

    return canvasContainer;
}