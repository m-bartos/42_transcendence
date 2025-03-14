import { User } from '../auth.js';
import { logout } from '../auth.js';


export async function fetchUserInfo() {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
    };
    try {
        const response = await fetch('http://localhost/api/auth/user/info', requestOptions)
        const data = await response.json();
        const user: User = {
            id: data.data.id || 1,
            username: data.data.username || 'default_username',
            email: data.data.email || 'default_email',
            avatar: data.data.avatar || './src/assets/images/defaultAvatar.png'
        }
        localStorage.setItem('user', JSON.stringify(user));
        console.log(`vypis z fetchUserInfo: ${localStorage.getItem('user')}`);
    } catch (error) {
        console.error('Error fetching user info:', error);
        logout();
    }
}