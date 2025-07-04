import { AuthManager } from '../../../api/user';
import { getUserInfo } from '../../../api/getUserInfo';
import { SingleUserDataManager } from '../../../api/singleUserData';
import { MultiGamesManager, SplitGamesManager} from '../../../api/gamesManager';
import { api_multiplayer_games_history_url, api_splitkeyboard_games_history_url } from '../../../config/api_url_config';
import { isMobileDevice } from '../../utils/game/gameUtils';
import imgUrlCat from '/src/assets/images/cat.png';
import imgUrlEagle from '/src/assets/images/eagle.png';
import imgUrlHipo from '/src/assets/images/hipo.png';
import imgUrlSloth from '/src/assets/images/sloth.png';
import imgUrlCheetah from '/src/assets/images/cheetah.png';

import Chart from 'chart.js/auto'; // Import Chart.js for pie chart visualization


interface PlayerAnimalConfig {
    imageSrc: string;
    hint: string;
}

interface PlayerData {
    id: number;
    username: string;
    avatar?: string | null;
}

interface GameData {
    splitGamesCount: number;
    multiGamesCount: number;
    opponentsByGames: Array<{username: string, gameCount: number}>;
}

interface ChartConfig {
    labels: string[];
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
}


export async function getPlayerData(originalPlayerId?: number): Promise<PlayerData | null> {
    if (!originalPlayerId) {
        let player = AuthManager.getUser();
        if (!player) {
            player = await getUserInfo();
        }
        return player;
    } else {
        const singleUserDataManager = new SingleUserDataManager();
        await singleUserDataManager.fetchUserDataFromServer(originalPlayerId);
        return singleUserDataManager.getUserData();
    }
}

export function createMainContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'w-full h-full flex flex-col items-center justify-center mt-8';
    return container;
}

export function showErrorMessage(container: HTMLElement, message: string): void {
    const errorElement = document.createElement('p');
    errorElement.className = 'text-2xl font-light text-center mb-6';
    errorElement.textContent = message;
    container.append(errorElement);
}

export async function renderDashboardContent(
    container: HTMLElement, 
    player: PlayerData, 
    playerStats: any, 
    multiManager: MultiGamesManager
): Promise <void> {
    // Header section
    renderPlayerHeader(container, player);
    
    // Statistics section
    renderPlayerStatistics(container, player, playerStats);
    
    // Win rate visualization
    renderWinRateVisualization(container, player, playerStats);
    
    // Additional statistics
    renderAdditionalStats(container, player, playerStats, multiManager);

    // Pie graph section
    renderPieGraphs(container, player, playerStats, multiManager);
    
    // Initialize tooltip
    initializeTooltip();
    
}

function renderPlayerHeader(container: HTMLElement, player: PlayerData): void {
    const characteristics = createElement('p', 'text-2xl font-light text-center mb-6', 'our HEROIC player');
    const header = createElement('h2', 'text-4xl font-normal text-center mb-6 break-all', `- ${player.username || 'Unknown Player'} -`);
    
    container.append(characteristics, header);
}

function renderPlayerStatistics(container: HTMLElement, player: PlayerData, playerStats: any): void {
    const statistics = createElement(
        'p', 
        'text-lg font-normal text-center mb-6 border-t border-gray-300 pt-4',
        `- has so far won ${playerStats.wins} out of ${playerStats.totalGames} game -`
    );
    
    const winRateDescription = getWinRateDescription(playerStats.winRate);
    const winRate = createElement(
        'p',
        'text-lg font-normal text-center mb-6',
        `- it makes his win rate ${winRateDescription} ${Math.round(playerStats.winRate)}% -`
    );
    
    container.append(statistics, winRate);
}

function renderWinRateVisualization(container: HTMLElement, player: PlayerData, playerStats: any): void {
    const winRate = Math.round(playerStats.winRate) || 0;
    const displayWinRate = Math.max(winRate, 10); // Minimum 10% for display
    
    const visualizationContainer = createElement('div', 'mx-auto relative w-9/10 lg:w-8/10 mt-12');
    
    // Animal image with tooltip
    const { imageSrc, hint } = getAnimalConfig(player.username || 'Unknown Player', winRate);
    const image = createAnimalImage(imageSrc, hint, displayWinRate);
    
    // Progress bar
    const progressBar = createProgressBar(winRate);
    
    visualizationContainer.append(image, progressBar);
    container.append(visualizationContainer);
}

function renderAdditionalStats(
    container: HTMLElement, 
    player: PlayerData, 
    playerStats: any, 
    multiManager: MultiGamesManager
): void {
    const opponentsText = createElement(
        'p',
        'text-lg font-normal text-center mb-6 mt-16',
        `- has played against ${playerStats.uniqueOpponents} unique ${getSIngularOrPlural(playerStats.uniqueOpponents)} -`
    );
    
    const scoreText = createElement(
        'p',
        'text-lg font-normal text-center mb-6',
        `- and reached a total score of ${playerStats.totalScore} points -`
    );
    
    const opponentsScoreText = createElement(
        'p',
        'text-lg font-normal text-center mb-6',
        `- while his ${getSIngularOrPlural(playerStats.uniqueOpponents)} scored ${playerStats.totalEnemyScore} points -`
    );
    
    const scoreVisualization = createScoreVisualization(playerStats);
    
    const averageTimeText = createElement(
        'p',
        'text-lg font-normal text-center mt-10 mb-12',
        `- average ${player.username || 'Unknown Player'}'s game time: ${multiManager.formatDuration(playerStats.averageDuration)} seconds -`
    );
    
    container.append(opponentsText, scoreText, opponentsScoreText, scoreVisualization, averageTimeText);
   
}

function createElement(tag: string, className: string, textContent?: string): HTMLElement {
    const element = document.createElement(tag);
    element.className = className;
    if (textContent) {
        element.textContent = textContent;
    }
    return element;
}

function getWinRateDescription(winRate: number): string {
    if (winRate < 35) return 'promissing';
    if (winRate < 70) return 'impresive';
    return 'absolutely exceptional';
}

function getSIngularOrPlural(opponents: number): string {
    return opponents === 1 ? 'opponent' : 'opponents';
}



function getAnimalConfig(username: string, winRate: number): PlayerAnimalConfig {
    const configs: { [key: string]: PlayerAnimalConfig } = {
        sloth: {
            imageSrc: imgUrlSloth,
            hint: `${username} is with his win rate of ${winRate}% still learning.\n\nAlthough a sloth may seem like a slow animal, it may simply be in no hurry and enjoying life. \n\nSpeed up a bit and be like a HIPO!`
        },
        hippo: {
            imageSrc: imgUrlHipo,
            hint: `${username} is with his win rate of ${winRate}% getting better.\n\nAt first glance, a hippo may not be a fast animal. But did you know that it can reach speeds of up to 30 km/h? \n\nSpeed up a bit and be like a CAT!`
        },
        cat: {
            imageSrc: imgUrlCat,
            hint: `${username} is with his win rate of ${winRate}% getting realy good!\n\nCats are known not only for their ability to sleep all day, but also for their admirably fast reflexes. \n\nSpeed up a bit and be like an EAGLE!`
        },
        eagle: {
            imageSrc: imgUrlEagle,
            hint: `${username} is with his win rate of ${winRate}% doing great!\n\nEagles are well known for their speed and agility. They can reach speeds of up to 160 km/h when diving. \n\nKeep it up and be like a CHEETAH!`
        },
        cheetah: {
            imageSrc: imgUrlCheetah,
            hint: `${username} is with his win rate of ${winRate}% a real champion, like a rocket!\n\nCheetahs are true champions. They rule the land thanks to their speed and agility. \n\nNo one can defeat them!`
        }
    };

    if (winRate <= 20) return configs.sloth;
    if (winRate <= 40) return configs.hippo;
    if (winRate <= 60) return configs.cat;
    if (winRate <= 80) return configs.eagle;
    if (winRate <= 100) return configs.cheetah;
    return configs.sloth;
}

function createAnimalImage(imageSrc: string, hint: string, displayWinRate: number): HTMLElement {
    const upperLine = document.createElement('div');
    upperLine.className = 'w-full absolute -top-11';
    
    const innerUpperLine = document.createElement('div');
    innerUpperLine.style.width = `${displayWinRate}%`;
    innerUpperLine.className = 'justify-end flex';
    
    const image = document.createElement('img');
    image.className = 'w-24 h-24 min-w-24 rounded-xl z-10 hover:cursor-pointer';
    image.src = imageSrc;
    image.alt = 'Animal image for win rate visualization';
    image.setAttribute('data-tooltip', hint);
    image.addEventListener('mouseover', showImageTooltip);
    image.addEventListener('mouseout', hideImageTooltip);
    
    innerUpperLine.append(image);
    upperLine.append(innerUpperLine);
    
    return upperLine;
}

function createProgressBar(winRate: number): HTMLElement {
    const bottomLine = document.createElement('div');
    bottomLine.className = 'w-full h-[24px] bg-white rounded-full flex items-center justify-start border border-gray-800 px-[1px]';
    
    const innerBottomLine = document.createElement('div');
    innerBottomLine.className = 'w-full pl-1 max-h-[20px] flex items-center bg-gray-600 rounded-full text-white justify-start flex-row';
    innerBottomLine.textContent = `${winRate}%`;
    innerBottomLine.style.width = `${winRate}%`;
    
    bottomLine.append(innerBottomLine);
    return bottomLine;
}

function createScoreVisualization(playerStats: any): HTMLElement {
    const outerScoreDiv = document.createElement('div');
    outerScoreDiv.className = 'w-9/10 lg:w-8/10 mt-8 h-[24px] bg-white rounded-full flex items-center justify-between border border-gray-800 px-[1px] text-end overflow-hidden';
    
    const opponentScore = createElement('p', 'text-lg font-normal text-center mr-1 text-gray-600', `${playerStats.totalEnemyScore}`);
    
    const playerScoreDiv = document.createElement('div');
    playerScoreDiv.className = 'w-full pl-1 max-h-[20px] flex items-center bg-gray-600 rounded-full text-white justify-start flex-row';
    playerScoreDiv.textContent = `${playerStats.totalScore}`;
    playerScoreDiv.style.width = `${(playerStats.totalScore / (playerStats.totalScore + playerStats.totalEnemyScore)) * 100}%`;
    if(playerStats.totalScore === 0) {
        playerScoreDiv.classList.remove('text-white', 'bg-gray-600');
        playerScoreDiv.classList.add('text-gray-600', 'bg-white');
    } else {
        playerScoreDiv.classList.remove('text-gray-600', 'bg-white');
        playerScoreDiv.classList.add('text-white', 'bg-gray-600');
    }
    if (playerStats.totalEnemyScore === 0) {
        opponentScore.classList.remove('text-gray-600');
        opponentScore.classList.add('text-white');
    }  else {
        opponentScore.classList.remove('text-white');
        opponentScore.classList.add('text-gray-600');
    }
    
    outerScoreDiv.append(playerScoreDiv, opponentScore);
    
    return outerScoreDiv;
}

// === DATA FETCHING ===
async function fetchGameData(
    player: PlayerData, 
    multiManager: MultiGamesManager
): Promise<GameData> {
    const splitManager = new SplitGamesManager(api_splitkeyboard_games_history_url);
    
    // Paralelní načítání dat
    const [splitResponse, multiResponse] = await Promise.all([
        splitManager.fetchSplitGames(player.id),
        multiManager.fetchMultiGames(player.id)
    ]);
    
    const splitGames = splitManager.getGames(splitResponse);
    const multiGames = multiManager.getGames(multiResponse);
    const opponentsByGames = multiManager.getOpponentsByGameCount(multiGames, player.id);
    
    return {
        splitGamesCount: splitGames.length,
        multiGamesCount: multiGames.length,
        opponentsByGames
    };
}

// === UI ELEMENTS CREATION ===
function createParentContainer(): HTMLElement {
    const parentContainer = document.createElement('div');
    parentContainer.className = 'max-w-9/10 h-180 lg:h-100 justify-around gap-32 lg:gap-0 flex flex-col lg:flex-row mb-48 lg:mb-8 border-t border-gray-300 pt-8';
    return parentContainer;
}

function createGraphContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'w-full lg:w-2/5 h-1/2 lg:h-full mt-2 flex flex-col items-center';
    return container;
}

function createGraphTitle(text: string): HTMLElement {
    const title = document.createElement('h2');
    title.className = 'text-xl font-light text-center w-full min-h-18';
    title.textContent = text;
    return title;
}

function createCanvas(id: string): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.className = 'w-[80%]';
    canvas.id = id;
    return canvas;
}

// === CHART DATA PREPARATION ===
function prepareOpponentsChartConfig(opponentsByGames: Array<{username: string, gameCount: number}>): ChartConfig {
    const opponentsLabels = opponentsByGames.slice(0, 3).map(opponent => opponent.username);
    const opponentsData = opponentsByGames.slice(0, 3).map(opponent => opponent.gameCount);
    
    return {
        labels: opponentsLabels,
        data: opponentsData,
        backgroundColor: ['DarkSalmon', 'DarkSeaGreen', 'LightSkyBlue'],
        borderColor: ['black', 'black', 'black'],
    };
}

function prepareGameTypesChartConfig(splitGamesCount: number, multiGamesCount: number): ChartConfig {
    return {
        labels: ['SplitKeyboard Games', 'Multiplayer Games'],
        data: [splitGamesCount, multiGamesCount],
        backgroundColor: ['DarkSalmon', 'DarkSeaGreen'],
        borderColor: ['black', 'black'],
        
    };
}

// === CHART CREATION ===
function createPieChart(canvas: HTMLCanvasElement, config: ChartConfig): Chart | null {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: config.labels,
            datasets: [{
                data: config.data,
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            aspectRatio: 1,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'black',
                        font: {
                            size: 14
                        },
                        padding: 20,
                    },
                    fullSize: false,
                },
            },
            animation: {
                easing: 'easeOutCubic',
                duration: 3000
            }
            
        }
    });
}

// === OPPONENTS CHART ===
function createOpponentsChart(
    parentContainer: HTMLElement, 
    player: PlayerData, 
    gameData: GameData
): void {
    const graphContainer = createGraphContainer();
    const graphTitle = createGraphTitle(`- ${player.username}'s top opponents -`);
    const chartCanvas = createCanvas('opponentsChart');
    
    const chartConfig = prepareOpponentsChartConfig(gameData.opponentsByGames);
    createPieChart(chartCanvas, chartConfig);
    
    graphContainer.append(graphTitle, chartCanvas);
    parentContainer.appendChild(graphContainer);
}

// === GAME TYPES CHART ===
function createGameTypesChart(
    parentContainer: HTMLElement, 
    gameData: GameData
): void {
    const graphContainer = createGraphContainer();
    const graphTitle = createGraphTitle('- multi and split game ratio -');
    const chartCanvas = createCanvas('gameTypesChart');
    
    const chartConfig = prepareGameTypesChartConfig(gameData.splitGamesCount, gameData.multiGamesCount);
    createPieChart(chartCanvas, chartConfig);
    
    graphContainer.append(graphTitle, chartCanvas);
    parentContainer.appendChild(graphContainer);
}

// === MAIN FUNCTION ===
async function renderPieGraphs(
    container: HTMLElement, 
    player: PlayerData, 
    playerStats: any, 
    multiManager: MultiGamesManager
): Promise<void> {
    try {
        // Načtení dat
        const gameData = await fetchGameData(player, multiManager);
        
        // Vytvoření hlavního kontejneru
        const parentGraphContainer = createParentContainer();
        
        // Vytvoření obou grafů
        createOpponentsChart(parentGraphContainer, player, gameData);
        createGameTypesChart(parentGraphContainer, gameData);
        
        // Přidání do stránky
        container.appendChild(parentGraphContainer);
        
    } catch (error) {
        console.error('Error rendering pie graphs:', error);
        
        // Zobrazení chybové zprávy uživateli
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-center p-4';
        errorDiv.textContent = 'Error loading charts. Please try again.';
        container.appendChild(errorDiv);
    }
}

function initializeTooltip(): void {
    const tooltip = document.createElement('div');
    tooltip.className = 'pointer-events-none fixed z-50 bg-gray-800 text-white text-sm px-2 py-1 rounded shadow opacity-0 transition-opacity duration-200';
    document.body.append(tooltip);
}

function showImageTooltip(e: MouseEvent): void {
    const target = e.currentTarget as HTMLElement;
    const text = target.dataset.tooltip;
    if (!text) return;

    const tooltip = document.querySelector('.pointer-events-none.fixed.z-50') as HTMLElement;
    if (!tooltip) return;

    tooltip.textContent = text;
    tooltip.style.left = `${e.clientX + 10}px`;
    tooltip.style.top = `${e.clientY + 10}px`;
    tooltip.style.padding = '1rem';
    tooltip.style.borderRadius = '0.5rem';
    tooltip.style.backgroundColor = 'white';
    tooltip.style.borderWidth = '2px';
    tooltip.style.borderColor = 'black';
    tooltip.style.color = 'black';
    tooltip.style.transition = 'opacity 0.3s ease-in-out';
    tooltip.style.opacity = '1';
    tooltip.style.maxWidth = '300px';
    tooltip.style.whiteSpace = 'pre-line';
}

function hideImageTooltip(): void {
    const tooltip = document.querySelector('.pointer-events-none.fixed.z-50') as HTMLElement;
    if (tooltip) {
        tooltip.style.opacity = '0';
    }
}
