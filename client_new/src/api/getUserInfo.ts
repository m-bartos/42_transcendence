import { api_getUserInfo_url } from "../config/api_url_config";
import { ApiErrors } from "../errors/apiErrors";


const token = localStorage.getItem('jwt');

export async function getUserInfo() {
    if (!token) {
        return
    }
    const body = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }

    try
    {
        const response = await fetch(api_getUserInfo_url, body);
        const { message, data } = await response.json();
        if (response.ok) {
            if (data) {
                window.localStorage.setItem("id", data.id);
                window.localStorage.setItem("username", data.username);
                window.localStorage.setItem("avatar", data.avatar);
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