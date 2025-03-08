interface User {
    username: string;
    token: string;
    email?: string;
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

        // Kontrola, zda request proběhl v pořádku
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Přihlášení selhalo');
        }

        // Parsování odpovědi
        let token :string;
        const data = await response.json();
        if(response.status === 200) {
            token = data.data.token;
            localStorage.setItem('jwt_token', token);
            //Uložení údajů o uživateli do localStorage
            const user: User = {
                username: data.username || username,
                token: data.data.token || 'default_token'
            };
            localStorage.setItem('user', JSON.stringify(user));
        }
        
        return true;
    } catch (error) {
        console.error('Chyba při přihlášení:', error);
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

        // Kontrola, zda request proběhl v pořádku
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Přihlášení selhalo');
        }

        // // Parsování odpovědi
        // const data = await response.json();
        
        // // Uložení údajů o uživateli do localStorage
        // const user: User = {
        //     username: data.username || username,
        //     email: data.email || email,
        //     token: data.token || 'default_token'
        // };
        
        // localStorage.setItem('user', JSON.stringify(user));
        return true;
    } catch (error) {
        console.error('Chyba při registraci:', error);
        throw error;
    }
}


export function logout(): void {
    localStorage.removeItem('jwt_token');
    //localStorage.removeItem('user');
    //localStorage.clear();
    window.location.href = '/';
}