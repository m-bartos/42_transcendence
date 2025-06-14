
export function displayError(error: any, parentElement: HTMLElement) {
    const errorLobby = document.createElement('div') as HTMLDivElement;
    errorLobby.id = 'tournamentLobby';
    errorLobby.className = "w-full min-h-max flex flex-col items-center mt-6 mb-auto min-w-[500px]";
    errorLobby.innerHTML = `
        <p class="text-2xl pb-6 w-4/5 md:w-3/5 text-center mx-auto">
            Error. <br><br>
            ${error} <br><br>
            Please try again later.
        </p>`
    parentElement.append(errorLobby);
}