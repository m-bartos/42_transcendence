import { api_login_url } from "../config/api_url_config";
import { ApiErrors} from "../errors/apiErrors";

export async function login(username: string, password: string) {
    const userData = {
        username: username,
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
        const response = await fetch(api_login_url, body);
        const { message, data } = await response.json();
        if (response.ok) {
            if (data) {
                window.localStorage.setItem("jwt", data.token);
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
    }
    catch (error: any) {
        throw error;
    }
}