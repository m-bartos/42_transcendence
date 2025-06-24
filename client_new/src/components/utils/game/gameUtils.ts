
// export function isMobileDevice() {
//       return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
//            (('ontouchstart' in window || navigator.maxTouchPoints > 0) && 
//             window.matchMedia('(max-width: 768px), (max-height: 768px)').matches);
//     }
// Alternativnii varianta, ktera by mela pokryt vetsi zarizeni...
//export  function isMobileDevice(): boolean {
//   const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
//   const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
//   const isUserAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//   return isUserAgentMobile || hasTouch || isCoarsePointer;
// }

// Dalsi varianta, ktera by mela pokryt vetsi zarizeni...
export function isMobileDevice(): boolean {
  let score = 0;

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) score++;
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) score++;
  if (window.matchMedia('(pointer: coarse)').matches) score++;
  if (window.matchMedia('(max-width: 1024px), (max-height: 1024px)').matches) score++;

  return score >= 2; // Např. stačí splnit aspoň 2 podmínky
}
    
export function isPortrait() { return window.innerHeight > window.innerWidth;};

export function restyleMultiGameLayoutToHeight() {
        const gameCanvasContainer = document.getElementById('gameCanvasContainer') as HTMLDivElement;
        if (gameCanvasContainer) {
          gameCanvasContainer.className = 'flex flex-col w-[90%] mx-auto relative items-center justify-center mb-1';
        }
        const gameCanvasWrapper = document.getElementById('gameCanvasWrapper') as HTMLDivElement;
        if (gameCanvasWrapper) {
          gameCanvasWrapper.className = 'aspect-[2/1] h-full border mx-auto border-gray-600 rounded-md overflow-hidden';
          gameCanvasWrapper.style.width = gameCanvasWrapper.parentElement?.clientWidth + 'px';
        }
        const multiPlayerTouchZone = document.getElementById('multiPlayerTouchZone') as HTMLDivElement;
        if (multiPlayerTouchZone) {
          multiPlayerTouchZone.className = 'rounded-md my-4 ml-2 mr-2 max-w-[20%] flex flex-col items-center justify-between select-none border-2 border-gray-400';
        }
    };

export  function restyleMultiGameLayoutToWidth() {
          const gameCanvasContainer = document.getElementById('gameCanvasContainer') as HTMLDivElement;
          if (gameCanvasContainer) {
            gameCanvasContainer.className = 'flex flex-row w-[90%] mx-auto relative items-center justify-between mb-1';
          }
          const gameCanvasWrapper = document.getElementById('gameCanvasWrapper') as HTMLDivElement;
          if (gameCanvasWrapper) {
            gameCanvasWrapper.className = 'aspect-[2/1] w-full max-h-full border mx-auto border-gray-600 rounded-md overflow-hidden';
          }
          const multiPlayerTouchZone = document.getElementById('multiPlayerTouchZone') as HTMLDivElement;
          if (multiPlayerTouchZone) {
            multiPlayerTouchZone.className = 'rounded-md w-1/10 flex flex-col items-center justify-between select-none border-2 border-gray-400';
          }
        };

export  function restyleTournamentGameLayoutToHeight() {
          const gameCanvasContainer = document.getElementById('gameCanvasContainer') as HTMLDivElement;
          if (gameCanvasContainer) {
            gameCanvasContainer.className = 'grid grid-cols-2 w-[90%] h-full mx-auto relative items-center justify-between mb-1';
          }
          const gameCanvasWrapper = document.getElementById('gameCanvasWrapper') as HTMLDivElement;
          if (gameCanvasWrapper) {
            gameCanvasWrapper.className = 'aspect-[2/1] col-span-2 w-auto h-auto border mx-auto border-gray-600 rounded-md overflow-hidden';
            gameCanvasWrapper.style.width = gameCanvasWrapper.parentElement?.clientWidth + 'px';
          }
          const splitTournamentTouchZone = document.getElementById('splitTournamentTouchZone') as HTMLDivElement;
          if (splitTournamentTouchZone) {
            splitTournamentTouchZone.className = 'justify-self-start rounded-md w-4/10 mt-4 h-full flex flex-col items-center justify-around select-none border-2 border-gray-400';
            gameCanvasContainer.insertBefore(gameCanvasWrapper, splitTournamentTouchZone);
          }
          const splitTournamentTouchZone2 = document.getElementById('splitTournamentTouchZone2') as HTMLDivElement
          if (splitTournamentTouchZone2) {
            splitTournamentTouchZone2.className = 'justify-self-end rounded-md w-4/10 mt-4 h-full flex flex-col items-center justify-around select-none border-2 border-gray-400';
          }
        };
        
export  function restyleTournamentGameLayoutToWidth() {
          const gameCanvasContainer = document.getElementById('gameCanvasContainer') as HTMLDivElement;
          if (gameCanvasContainer) {
            gameCanvasContainer.className = 'mx-auto w-[90%] grid grid-cols-3 items-center justify-around mb-1';
          }
          const gameCanvasWrapper = document.getElementById('gameCanvasWrapper') as HTMLDivElement;
          if (gameCanvasWrapper) {
            gameCanvasWrapper.className = 'aspect-[2/1] justify-self-center flex-grow max-h-full border border-gray-600 rounded-md overflow-hidden';
          }
          const splitTournamentTouchZone = document.getElementById('splitTournamentTouchZone') as HTMLDivElement;
          if (splitTournamentTouchZone && gameCanvasWrapper && gameCanvasContainer) {
            splitTournamentTouchZone.className = 'justify-self-start rounded-md w-[20%] h-full flex flex-col items-center justify-around select-none border-2 border-gray-400';
            gameCanvasContainer.insertBefore(splitTournamentTouchZone, gameCanvasWrapper);
          }
          const splitTournamentTouchZone2 = document.getElementById('splitTournamentTouchZone2') as HTMLDivElement;
          if (splitTournamentTouchZone2) {
            splitTournamentTouchZone2.className = 'justify-self-end rounded-md w-[20%] h-full flex flex-col items-center justify-around select-none border-2 border-gray-400';
          }
       };