import { scoreBoard } from './scoreBoard.js';
import { getBaseUrl } from './game.js';

export function renderCanvas(gameId : string | number |null) : HTMLDivElement {


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
    const sound = new Audio('./src/assets/audio/paddle.wav');
    const pointMade = new Audio('./src/assets/audio/point.wav');
    pointMade.volume = 0.4;
    const ending = new Audio('./src/assets/audio/end.wav');
    ending.loop = false;
    let touchLeft : boolean = false;
    let touchRight : boolean = false;
    const sounds: HTMLAudioElement[] = [sound, pointMade, ending];

    
    const canvasContainer = document.createElement('div');
    canvasContainer.className = ' relative flex flex-col  container mx-auto w-full justify-start';
    //canvasContainer.className = 'relative aspect-video w-full max-w-3xl mx-auto bg-gray-200';
    canvasContainer.style.height = '75vh';
    //canvasContainer.style.padding-top = '56.25%';

    
    const scoreElement = document.createElement('div');
    scoreElement.className = 'relative grid sm:grid-cols-3 gap-4 rounded-md bg-gray-600 mb-2 text-center text-white text-2xl';
    scoreElement.style.fontSize = '2em';
    scoreElement.style.zIndex = '100';
    //scoreElement.style.top = '-50px';
    scoreElement.textContent = 'Score: 0';
    scoreElement.innerHTML = scoreBoard;
    
    const gameCanvas = document.createElement('canvas');
    gameCanvas.className = 'relative bg-gray-400 rounded-md border-2 border-gray-500';
    console.log("canvas created");

    const countDownElement = document.createElement('div');
    countDownElement.className = 'hidden absolute z-100 px-10 py-6 top-50 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl text-white bg-graz-800 rounded-md';
    countDownElement.id = 'countdown';
    countDownElement.textContent = '';
    //-----------------------------------------------------------------------------------------------
    const musicButtonCarrier = document.createElement('div');
    musicButtonCarrier.className = 'hidden sm:inline absolute z-100 top-[3rem] left-[2rem] flex flex-row items-center justify-center';
    
    const musicCheckButton = document.createElement('input');
    musicCheckButton.type = 'checkbox';
    musicCheckButton.id = 'musicCheck';
    musicCheckButton.checked = true;
    musicCheckButton.className = 'mt-3 mb-2 mx-2'

    const musicCheckLabel = document.createElement('label');
    musicCheckLabel.setAttribute('for', 'musicCheck');
    musicCheckLabel.textContent = 'sound';
    musicCheckLabel.className = 'text-white text-xl font-bolder m-2';

    musicButtonCarrier.appendChild(musicCheckLabel);
    musicButtonCarrier.appendChild(musicCheckButton);
    //-----------------------------------------------------------------------------------------------
    const touchZone = document.createElement('div');
    touchZone.id = 'swipeZone';
    touchZone.className = 'w-1/6 h-1/6 rounded-full mx-auto mt-10 md:hidden flex flex-col items-center justify-center text-white text-2xl select-none border-2 border-gray-500';
    //touchZone.textContent = '🎮';
    const arrowUp = document.createElement('span');
    arrowUp.className = 'text-xl block text-gray-500';
    arrowUp.innerHTML = '&#9651;';
    const circle = document.createElement('span');
    circle.className = 'text-xl block text-gray-500 my-2';
    circle.innerHTML = '&#9678;';
    const arrowDown = document.createElement('span');
    arrowDown.className = 'text-xl block text-gray-500';
    arrowDown.innerHTML = '&#9661;';

    touchZone.appendChild(arrowUp);
    touchZone.appendChild(circle);
    touchZone.appendChild(arrowDown);
    
    //-----------------------------------------------------------------------------------------------
    const cancelGameButton = document.createElement('button');
    cancelGameButton.className = 'hidden sm:block shadow-sm shadow-gray-400 bg-red-800 border-2 border-red-900 text-white font-bold py-2 px-4 rounded mt-4 mr-auto cursor-pointer';
    cancelGameButton.textContent = 'Cancel game';
    cancelGameButton.addEventListener('click', closeGame);

    scoreElement.appendChild(countDownElement)
    scoreElement.appendChild(musicButtonCarrier);
    canvasContainer.appendChild(scoreElement);
    canvasContainer.appendChild(gameCanvas);
    canvasContainer.appendChild(cancelGameButton);
    canvasContainer.appendChild(touchZone);
    
    
    const ctx = gameCanvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas not supported');
        return canvasContainer;
    }
    requestAnimationFrame(() => {
        gameCanvas.width = canvasContainer.offsetWidth;
        gameCanvas.height = gameCanvas.width * 1/2;
        let canvasPosition = gameCanvas.getBoundingClientRect();
        
        console.log('Canvas size:', gameCanvas.width, gameCanvas.height);
        console.log('Canvas position:', canvasPosition);
    });

    const player1Name = scoreElement.querySelector('#player1') as HTMLDivElement;
    const player2Name = scoreElement.querySelector('#player2') as HTMLDivElement;
    const score1 = scoreElement.querySelector('#score1') as HTMLDivElement;
    const score2 = scoreElement.querySelector('#score2') as HTMLDivElement;
    
    
    const settingsElement = document.getElementById('gameSettings') as HTMLDivElement;
    const gameContainer = document.getElementById('gameContainer') as HTMLDivElement;
    


    //document.addEventListener('mouseup', handleMouseClick)

    // function handleMouseClick(event: MouseEvent): void {
    //     if(gameCanvas){
    //         if(event.target === gameCanvas || event.target === musicButtonCarrier || event.target === musicCheckButton || event.target === musicCheckLabel){
    //             return;
    //         }
    //         else {
    //             console.log('Clicked : ' , event.target);
    //             closeGame();
    //         }
    //     }
    // }

    function resizeCanvas() {
        gameCanvas.width = canvasContainer.clientWidth;
        //gameCanvas.height = canvasContainer.offsetHeight;
        gameCanvas.height = gameCanvas.width * 1/2;
        //requestAnimationFrame(drawGame);
        let canvasPosition = gameCanvas.getBoundingClientRect();
        // console.log('Canvas size:', gameCanvas.width, gameCanvas.height);
        // console.log('Canvas position:', canvasPosition);
        console.log(window.innerWidth);
    }
    
    window.addEventListener("resize", resizeCanvas);
    

    function openGameSocket(gameId: string | number | null, playerJWT: string): void {
        if (gameSocket) gameSocket.close();
        gameSocket = new WebSocket(`ws://${getBaseUrl()}/api/game/ws/${gameId}?playerJWT=${playerJWT}`);
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
            if(gameState.status === 'live'){
                makeSound(currentMessage, prevMessage);
            }

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
            animate();
        }
    }



    function makeSound(current : any, previous: any) : void {
        //musicCheckButton.addEventListener('change', () => {
        if (!musicCheckButton.checked) {
            return;
        } 
        else {
            if(current.ball.x < 50 && (current.ball.x > previous.ball.x) && touchLeft === false){
                sound.play();
                touchLeft = true;
                touchRight = false;
            }
            else if(current.ball.x > 50 && (current.ball.x < previous.ball.x) && touchRight === false){
                sound.play();
                touchLeft = false;
                touchRight = true;
            }
            else if(current.ball.x < 1 || current.ball.x > 99){
                pointMade.play();
                touchLeft = false;
                touchRight = false;
            }
            else return;
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
        if(window.innerWidth >= 640 && musicCheckButton.checked){
            ending.play();
        }
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
   
    let keysPressed = { ArrowUp: false, ArrowDown: false };

    //Pridavame event listenery na klavesy a jejich stlaceni/uvolneni posilame na server
    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    function handleKeyDown(event: KeyboardEvent):void {
        event.preventDefault();
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
        let direction = 0;
        if (keysPressed.ArrowUp && !keysPressed.ArrowDown) direction = -1;
        else if (keysPressed.ArrowDown && !keysPressed.ArrowUp) direction = 1;
        if (gameState.status === 'live' && gameSocket) {
            gameSocket.send(JSON.stringify({ type: 'movePaddle', direction }));
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
            //document.removeEventListener('mouseup', handleMouseClick )
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('popstate', listener);
        }
    }
    // const pushUrl = (href) => {
    // history.pushState({}, '', href);
    // window.dispatchEvent(new Event('popstate'));
    // };
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    const swipeZone = canvasContainer.querySelector('#swipeZone') as HTMLDivElement;

    if(!swipeZone) {
        console.error('Swipe zone not found');
        return canvasContainer;
    }
    // Touch start → uložíme výchozí pozici
    if(swipeZone) {
        let startY = 0;
        let currentDirection: 'up' | 'down' | 'idle' = 'idle';
     
        // Nastavíme vzhled swipeZone tak, aby bylo jasné, že jde o ovládací prvek
        swipeZone.style.cursor = 'pointer';
        
        const setMovement = (direction: 'up' | 'down' | 'idle') => {
            currentDirection = direction;
     
            switch (direction) {
                case 'up':
                sendMobilePaddleDirection(-1);
                break;
                case 'down':
                sendMobilePaddleDirection(1);
                break;
                case 'idle':
                sendMobilePaddleDirection(0);
                break;
            }
        };
         
        // Odstraníme passive: true
        swipeZone.addEventListener('touchstart', e => {
            startY = e.touches[0].clientY;
        });
     
        // Odstraníme passive: true, aby preventDefault fungoval
        swipeZone.addEventListener('touchmove', e => {
            e.preventDefault(); // Zabrání scrollování stránky
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            const threshold = 20;
     
            if (Math.abs(deltaY) < threshold) {
                setMovement('idle');
            } else if (deltaY < 0) {
                setMovement('up');
            } else {
                setMovement('down');
            }
        });
     
        // Ostatní event listenery ponecháme
        swipeZone.addEventListener('touchend', () => {
            setMovement('idle');
        });
        
        swipeZone.addEventListener('touchcancel', () => {
            setMovement('idle');
        });

        function sendMobilePaddleDirection(direction : number) : void {
            if (gameState.status === 'live' && gameSocket) {
                gameSocket.send(JSON.stringify({ type: 'movePaddle', direction }));
            }
        }
   }
    //----------------------------------------------------------------------------------------------------------------------------------------------
    return canvasContainer;
}