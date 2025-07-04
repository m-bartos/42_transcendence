// Jednoduchá toast notifikace
export function showToast(message: string, type: 'loading' | 'success' | 'error' = 'loading') {
    // Odstranit existující toast
    const existingToast = document.getElementById('logout-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.id = 'logout-toast';
    toast.className = `fixed top-16 right-50 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300 transform translate-x-0`;
    
    // Barvy podle typu
    if (type === 'loading') {
        toast.className += ' border border-blue-800';
    } else if (type === 'success') {
        toast.className += ' border border-green-800';
    } else {
        toast.className += ' border-2 border-red-800';
    }
    
    // Ikona podle typu
    const icon = document.createElement('div');
    if (type === 'loading') {
        icon.className = 'animate-spin rounded-full h-5 w-5 border-b-2 border-white';
    } else if (type === 'success') {
        icon.innerHTML = '✓';
        icon.className = 'text-lg font-bold';
    } else {
        icon.innerHTML = '✕';
        icon.className = 'text-lg font-bold';
    }
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);
    
    // Animace vstupu
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 200);
    
    // Automatické skrytí po 2.5 sekundách
    setTimeout(() => {
        hideToast();
    }, 4000); 
    return toast;
}

export function hideToast() {
    const toast = document.getElementById('logout-toast');
    if (toast) {
        toast.style.transform = 'translateX(full)';
        setTimeout(() => toast.remove(), 300);
    }
}