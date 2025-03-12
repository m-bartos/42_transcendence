import { CustomError } from './components/customError.js';
import { showAlert } from './components/modal.js';

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
            //vytvorime custom error - pridavame status code
            let customError = new CustomError(response.status);
            if(response.status === 409) {
                //pridame message do custom erroru
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
            username: data.data.username || 'default_username',
            email: data.data.email || 'default_email'
        }
        localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
        console.error('Error fetching user info:', error);
        logout();
    }
}


export async function logout(): Promise<void> {
    //pokud je platny token, pokracujeme v odhlaseni, v opacnem pripade nam funkce refreshToken() vyhodi hlasku pro usera a zde se odhlasime
    if(await refreshToken()){
        const requestOptions = {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            }
        };
        try {
            const response = await fetch('http://localhost/api/auth/logout', requestOptions);
            if (response.status === 200) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user');
                localStorage.clear();
                window.location.href = '/';
            }
            else if(!response.ok) {
                //kdyz se vrati 400 401 500 tedy existujici response, tak se odhlasime lokalne a zobrazime alert
                await showAlert({
                    title: "Important message",
                    message: `The log out failed \r\nBut don't worry, your data are safe \r\nYou will now be redirected to the LogIn page`,
                    type: "error",
                    position: "center",
                    buttonText: "I copy that"
                });
                cleanDataAndReload();
            }
        }
        catch (error) {
            if (error instanceof Error) {
                //Kdyz se chyba vyskytne pri fetchi user info, tak se odhlasime lokalne a zobrazime alert, co dal?????????????????????????????????????????????????????
                console.log('Error fetching user info v Catch error logout:', error.message);
                await showAlert({
                    title: "Important message",
                    message: `${error.message}\r\nThe log out failed \r\nBut don't worry, your data are safe \r\nYou will now be redirected to the LogIn page`,
                    type: "error",
                    position: "center",
                    buttonText: "I copy that"
                });
            }
            cleanDataAndReload();
        }
    }
    else{
        //TODO zobrazit alert pro usera jinym zpusobem !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        window.alert("Your session has expired. Please log in again. - Nepovedlo se refreshnout token");
        cleanDataAndReload();
    }
};

export async function refreshToken() : Promise<boolean> {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
    };
    try {
        const response = await fetch('http://localhost/api/auth/user/refresh', requestOptions);
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jwt_token', data.data.token);
            return true;
        }
        else if(response.status === 401) {
            console.log("Refresh token failed - 401");
            //TODO zobrazit alert pro usera jinym zpusobem !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            window.alert("Your session has expired. Please log in again. - 401");
            return false;
        }
        else {
            console.log("Refresh token failed - 400/500");
            //TODO: chybove hlaseni pro usera jinym zpusobem!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            window.alert("Error refreshing token -- Else function refreshToken() - 400/500");
            return false;
        }
    } catch (error) {
        console.error('Error refreshing token from nginx:', error);
        //TODO: chybove hlaseni pro usera !jinym zpusobem!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        window.alert("Error refreshing token -- Catch function refreshToken() -- nginx");
        return false;
    }
}

function cleanDataAndReload() : void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    localStorage.clear();
    window.location.href = '/';
}