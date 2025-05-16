
export function setHtmlParentProps(parentDiv: HTMLDivElement) {
    if (!parentDiv) {
        return new Error(`No ${parentDiv} found.`);
    }
    parentDiv.replaceChildren();
    parentDiv.className = "md:container mx-auto md:p-4"
}