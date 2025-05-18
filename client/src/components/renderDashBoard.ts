import { User } from '../auth.js';
import { getApiBaseUrl } from '../auth.js';

export function renderDashBoardContent() : HTMLDivElement {
    const container = document.createElement('div');
    
    




    //funkcni cast-----------------------------------------------------------------------------------------------------------------------------------
    async function fetchDashboard() {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
        };
        const url = `${getApiBaseUrl()}/api/match/matches`; // Změňte na správný endpoint
        try {
            const response = await fetch(url, requestOptions)
            if(!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log('Dashboard data:', data);
            
        } catch (error) {
            container.innerHTML = `${error}`;
            console.error('Error fetching matches:', error);
        }
    }
    fetchDashboard();
    return container;
};