import { initRouter } from '../router.js';
import { renderHomePage } from './home.js';

export function renderSplitKeyboardDetails(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center min-w-[480px] w-full overflow-hidden py-12';
    
//-------------------------------------------------------------------------------------------------------------------------------------------------------------

//header section
const pageHeader = document.createElement('h2');
pageHeader.className = 'text-2xl pb-12 uppercase w-4/5 md:w-3/5 text-center border-b-1 border-gray-200 tracking-[1rem]';
pageHeader.innerText = 'Game Settings';

//plaayer names section
const playerNames = document.createElement('div');
playerNames.className = 'flex flex-col md:flex-row items-center justify-center w-full md:justify-around pt-12';

const player1Name = document.createElement('div');
player1Name.className = 'flex flex-col items-center w-4/5 md:w-2/5';
const player1NameLabel = document.createElement('label');
player1NameLabel.className = 'text-xl mb-2';
player1NameLabel.innerText = 'Player 1 Name:';
const player1NameInput = document.createElement('input');
player1NameInput.type = 'text';
player1NameInput.placeholder = 'Max 24 characters';
player1NameInput.maxLength = 24;
player1NameInput.className = 'border border-gray-300 rounded px-4 py-2 w-full';

const player2Name = document.createElement('div');
player2Name.className = 'flex flex-col items-center w-4/5 md:w-2/5';
const player2NameLabel = document.createElement('label');
player2NameLabel.className = 'text-xl mb-2';
player2NameLabel.innerText = 'Player 2 Name:';
const player2NameInput = document.createElement('input');
player2NameInput.type = 'text';
player2NameInput.placeholder = 'Max 24 characters';
player2NameInput.maxLength = 24;
player2NameInput.className = 'border border-gray-300 rounded px-4 py-2 w-full';

player1Name.append(player1NameLabel, player1NameInput);
player2Name.append(player2NameLabel, player2NameInput);
playerNames.append(player1Name, player2Name);

//color selector section
const colorSelector = document.createElement('div');
colorSelector.className = 'flex flex-col items-center justify-center w-full  lg:justify-around mt-24';

const colorSelectorHeader = document.createElement('h2');
colorSelectorHeader.className = 'text-xl mb-12 uppercase tracking-widest';
colorSelectorHeader.innerText = 'Pick colors for your game';

const colorSelectorBody = document.createElement('div');
colorSelectorBody.className = 'flex flex-col lg:flex-row items-center justify-center w-full lg:justify-around';

const colorSelectorBodyLeft = document.createElement('div');
colorSelectorBodyLeft.className = 'flex flex-col items-center w-4/5 lg:w-2/5';

const colorSelectorBodyLeftLabel1 = document.createElement('p');
colorSelectorBodyLeftLabel1.className = 'pl-4 text-xl mb-2 w-full text-start';
colorSelectorBodyLeftLabel1.innerText = 'Background Color:';

const colorSelectorBodyLeftLabel2 = document.createElement('p');
colorSelectorBodyLeftLabel2.className = 'pl-4 text-xl mb-2 w-full text-start';
colorSelectorBodyLeftLabel2.innerText = 'Paddle Color:';

const colorSelectorBodyLeftLabel3 = document.createElement('p');
colorSelectorBodyLeftLabel3.className = 'pl-4 text-xl mb-2 w-full text-start';
colorSelectorBodyLeftLabel3.innerText = 'Ball Color:';

const colorSelectorBodyLeftRow1 = document.createElement('div');
colorSelectorBodyLeftRow1.className = 'flex gap-2 mb-2';
colorSelectorBodyLeftRow1.id = 'bg-color-row';

const colorSelectorBodyLeftRow2 = document.createElement('div');
colorSelectorBodyLeftRow2.className = 'flex gap-2 mb-2';
colorSelectorBodyLeftRow2.id = 'paddle-color-row';

const colorSelectorBodyLeftRow3 = document.createElement('div');
colorSelectorBodyLeftRow3.className = 'flex gap-2';
colorSelectorBodyLeftRow3.id = 'ball-color-row';

const colorSelectorBodyRight = document.createElement('div');
colorSelectorBodyRight.className = 'flex flex-col items-center mt-12 lg:mt-0 h-auto w-4/5 lg:w-2/5';

const canvasPreview = document.createElement('canvas');
canvasPreview.id = 'colorCanvas';
canvasPreview.width = 500;
canvasPreview.height = 250;
canvasPreview.className = 'border border-gray-400 rounded-md';

colorSelectorBodyLeft.append(colorSelectorBodyLeftLabel1, colorSelectorBodyLeftRow1);
colorSelectorBodyLeft.append(colorSelectorBodyLeftLabel2, colorSelectorBodyLeftRow2);
colorSelectorBodyLeft.append(colorSelectorBodyLeftLabel3, colorSelectorBodyLeftRow3);

colorSelectorBodyRight.append(canvasPreview);

colorSelectorBody.append(colorSelectorBodyLeft, colorSelectorBodyRight);

colorSelector.append(colorSelectorHeader, colorSelectorBody);

//buttons section
const buttonSection = document.createElement('div');
buttonSection.className = 'flex flex-col md:flex-row items-center justify-center w-full md:justify-around mt-24';

const cancelButton = document.createElement('button');
cancelButton.className = 'px-8 py-4 rounded-md bg-slate-200 hover:bg-orange-200 transition duration-200 ease-in-out border-1 border-gray-300 text-2xl opacity-75 hover:opacity-100 min-w-[200px] inset-shadow-sm hover:ring-1     inset-shadow-slate-800 hover:inset-shadow-slate-400 mb-4 md:mb-0';
cancelButton.innerText = 'Cancel';
cancelButton.id = 'cancelBtn';

const confirmButton = document.createElement('button');
confirmButton.className = 'px-8 py-4 rounded-md bg-slate-200 hover:bg-green-200 transition duration-200 ease-in-out border-1 border-gray-300 text-2xl opacity-75 hover:opacity-100 min-w-[200px] inset-shadow-sm hover:ring-1     inset-shadow-slate-800 hover:inset-shadow-slate-400';
confirmButton.innerText = 'Lets Play!';
confirmButton.id = 'confirmBtn';


buttonSection.append(cancelButton, confirmButton);



container.append(pageHeader, playerNames, colorSelector, buttonSection);



//-------------------------------------------------------------------------------------------------------------------------------------------------------------


    const mainContent = document.getElementById('app') as HTMLDivElement;
    mainContent.innerHTML = '';
    if(mainContent && container) {
        mainContent.append(container);
    }
    const colors = ['#000000', '#FFFFFF', '#cd0000', '#006b3c', '#60a5fa', '#fbbf24']; // červená, zelená, modrá, žlutá

    const bgColorRow = document.getElementById('bg-color-row')!;
    const paddleColorRow = document.getElementById('paddle-color-row')!;
    const ballColorRow = document.getElementById('ball-color-row')!;
    const canvas = document.getElementById('colorCanvas') as HTMLCanvasElement;
    const paddleHeight = canvas.height / 4;
    const paddleWidth = 5;
    const ballRadius = 10;
    const ctx = canvas.getContext('2d')!;
    const confirmBtn = document.getElementById('confirmBtn')!;

    let selectedBackground: string = colors[1];
    let selectedPaddle: string = colors[0];
    let selectedBall: string = colors[2];

    // Vykresli canvas s aktuálními barvami
    function drawCanvas() {
        // canvas.width = colorSelectorBodyRight.offsetWidth;
        // canvas.height = colorSelectorBodyRight.parentElement!.offsetHeight;
        // Pozadí
        ctx.fillStyle = selectedBackground;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Palka 1
        ctx.fillStyle = selectedPaddle;
        ctx.fillRect(0, (canvas.height /2 ) - (paddleHeight / 2), paddleWidth, paddleHeight);

        // Palka 2
        ctx.fillStyle = selectedPaddle;
        ctx.fillRect(canvas.width - 5, (canvas.height /2 ) - (paddleHeight / 2), paddleWidth, paddleHeight);

        // Kulička
        ctx.fillStyle = selectedBall;
        ctx.beginPath();
        ctx.arc(canvas.width/2 - 5,canvas.height/2 - 5, ballRadius, 0,2*Math.PI);
        ctx.fill();
    }

    // Vytvoř kruh pro barvu
    function createColorCircle(color: string, onClick: () => void): HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'w-12 h-12 rounded-full cursor-pointer border-2 border-gray-100 hover:ring-2 ring-offset-2';
        div.style.backgroundColor = color;
        div.onclick = () => {
            onClick();
            drawCanvas();
        };
        return div;
    }

    // Inicializace barevných kruhů
    colors.forEach(color => {
        const bgCircle = createColorCircle(color, () => selectedBackground = color);
        const paddleCircle = createColorCircle(color, () => selectedPaddle = color);
        const ballCircle = createColorCircle(color, () => selectedBall = color);
        bgColorRow.appendChild(bgCircle);
        paddleColorRow.appendChild(paddleCircle);
        ballColorRow.appendChild(ballCircle);
    });

    // Confirm akce
    function handleConfirm(colors: { background: string; paddle: string; ball: string }) {
        console.log('Confirmed colors:', colors);
        // Zde můžeš zavolat další logiku / odeslání dat apod.
    }

    confirmBtn.addEventListener('click', () => {
        handleConfirm({
            background: selectedBackground,
            paddle: selectedPaddle,
            ball: selectedBall

        });
        // Zde můžeš zavolat další logiku / odeslání dat apod.
    });
    // První vykreslení
    drawCanvas();

    cancelButton.addEventListener('click', () => {
        if (mainContent) {
            mainContent.innerHTML = '';
            mainContent.append(renderHomePage());
            initRouter(mainContent);
        }
    });

    return container;
}