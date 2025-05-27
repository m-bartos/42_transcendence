
export function renderFooter(parentElement: HTMLElement) {
    const footer = document.createElement('footer');
    footer.className = "w-full md:w-2/3 border-t border-gray-300 mx-auto relative h-full";
    footer.innerHTML = `
        <!-- Footer -->
            <!-- Footer -->
            <footer class=" p-8 text-center tracking-widest">
                <p>&copy; ${new Date().getFullYear()} TrdLaZe42. All rights reserved.</p>
            </footer>
    `;
    parentElement.append(footer);
};

