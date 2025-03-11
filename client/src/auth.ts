import { CustomError } from './components/customError.js';

interface User {
    id: number;
    username: string;
    token?: string;
    email: string;
    avatar?: string;
}

export function checkAuth(): boolean {
    const userJson = localStorage.getItem('jwt_token');
    return userJson !== null;
}

export function getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
}

export async function login(username: string, password: string): Promise<boolean> {
    try {
        // Připravíme data pro odeslání
        const requestData = {
            username: username,
            password: password
        };

        // Nastavení parametrů požadavku
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        };

        // Odeslání požadavku na server
        const response = await fetch('http://localhost/api/auth/login', requestOptions);
        console.log("hned za fetch login: ", response); 

        // Parsování odpovědi
        const data = await response.json();
        console.log("Data login status + message:", response.ok, response.status);

        // Kontrola, zda request proběhl v pořádku
        if(response.status === 200) {
            //Kontrola, zda odpověď obsahuje očekávaná data
            if (data && data.data && data.data.token) {
                //Uložení JWT tokenu do localStorage
                localStorage.setItem('jwt_token', data.data.token);
                
                try {
                    await fetchUserInfo();
                } catch (userInfoError) {
                    console.error('Chyba při načítání informací o uživateli:', userInfoError);
                    // Přesto pokračujeme, protože přihlášení bylo úspěšné ???????????????????????
                }
                
                return true;
            } else {
                console.error('Odpověď neobsahuje očekávaná data s tokenem');
                return false;
            }
        }
        else {
            //vytvorime custom error - pridavame status code
            let customError = new CustomError(response.status, data.message);
            if(response.status === 401) {
                console.log("Custom error:", customError.code, ...customError.messages);
                throw customError;
            }
            else {
                console.log("Chyba pri loginu VSEOBECNA 1.: ", data.message);
                console.log("Custom error:", customError.code, ...customError.messages);
                throw customError;
            }
        }

    } catch (error) {
        console.error('Chyba pri loginu VSEOBECNA 2:', error);
        localStorage.setItem("Error2", JSON.stringify(error));
        throw error;
    }
}


export async function register(username: string, email: string, password: string): Promise<boolean> {
    try {
        // Připravíme data pro odeslání
        const requestData = {
            username: username,
            email: email,
            password: password,

        };
        // Nastavení parametrů požadavku
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        };

        // Odeslání požadavku na server
        const response = await fetch('http://localhost/api/auth/user', requestOptions);
        const data = await response.json();

        if (!response.ok) {
            //parsujeme chybovou odpoved
            //vytvorime custom error - pridavame status code
            let customError = new CustomError(response.status);
            if(response.status === 409) {
                
                customError = new CustomError(response.status, data.conflict);
               
                throw customError;
            }
            else {
                console.log("Chyba pri registraci VSEOBECNA 1.: ", data.message);
                throw Error;
            }
        }
        return true;
    } catch (error) {
        console.error('Chyba při registraci VSEOBECNA 2:', error);
        throw error;
    }
}

async function fetchUserInfo() {
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
            username: data.data.username || 'default_username11',
            email: data.data.email || 'default_email11'
        }
        localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
        console.error('Error fetching user info:', error);
        logout();
    }
}


export function logout(): void {
    console.log("logout called");
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    //localStorage.removeItem('user');
    //localStorage.clear();
    window.location.href = '/';
}
