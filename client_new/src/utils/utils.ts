export function setPageTitle(text: string) {
    let titleEl = document.querySelector('title');
    if(!titleEl) {
        titleEl = document.createElement('title');
        document.head.appendChild(titleEl);
    }
    titleEl.textContent = text;
}


