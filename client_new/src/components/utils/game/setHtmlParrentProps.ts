
export function setHtmlParentProps(parentDiv: HTMLDivElement) {
    if (!parentDiv) {
        return new Error(`No ${parentDiv} found.`);
    }
    parentDiv.replaceChildren();
    parentDiv.className = ""
}