import { api_register_url } from "../config/api_url_config";
import { ApiErrors } from '../errors/apiErrors'


// Function to register a new user
export async function register(username: string, email: string, password: string) {
    const userData = {
        username: username,
        email: email,
        password: password,
    }
    const body = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    }
    try
    {
        const response = await fetch(api_register_url, body);
        const { message, data, conflict } = await response.json();
        if (response.ok) {
            if (data) {
                window.sessionStorage.setItem("username", data.username); //toto je jen pro automaticke vyplneni jmena na loginu hned po registraci, jinak k nicemu...
            }
            else {
                throw new ApiErrors(response.status, 'no data received');
            }
        }
        else if (response.status === 400) {
            throw new ApiErrors(response.status, message, null);
        }
        else if (response.status === 401) {
            throw new ApiErrors(response.status, message, null);
        }
        else if (response.status === 404) {
            throw new ApiErrors(response.status, 'Invalid url or api call', null);
        }
        else if (response.status === 409) {
            if (conflict) {
                throw new ApiErrors(response.status, `User with the same ${conflict} already exists`, null);
            }
        }
    }
    catch (error: any) {
        throw error;
    }
}