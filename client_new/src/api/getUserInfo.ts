import {api_getUserInfo_url, generateStaticDataUrl} from "../config/api_url_config";
import { ApiErrors } from "../errors/apiErrors";
import { AuthManager, UserData } from "./user";
import defaultAvatarUrl from '../assets/images/defaultAvatar.png'


export function getToken(): string | null {
  return localStorage.getItem('jwt');
}

export async function getUserInfoFromServer(): Promise<void> {
  const token = getToken();
  
  if (!token) {
    return;
  }

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  };

  try {
    const response = await fetch(api_getUserInfo_url, requestOptions);
    const { message, data } = await response.json();
    
    if (response.ok) {
      if (data) {
        AuthManager.setUser(data.id, data.username, data.email, data.avatar, data.mfa);
      } else {
        throw new ApiErrors(response.status, 'no data received');
      }
    } else if (response.status === 400) {
      throw new ApiErrors(response.status, message, null);
    } else if (response.status === 401) {
      throw new ApiErrors(response.status, message, null);
    } else {
      throw new ApiErrors(response.status, message || 'Unknown error', null);
    }
  } catch (error: any) {
    AuthManager.clear();
    throw error;
  }
}

export async function getUserInfo(): Promise<UserData | null> {
  // Nejdřív zkontroluj cache
  const cachedUser = AuthManager.getUser();
  if (cachedUser) {
    return cachedUser;
  }
  try {
    await getUserInfoFromServer();
    return AuthManager.getUser();
  } catch (error) {
    throw error;
  }
}

export function getAvatar(avatar: string | null): string {
  if(!avatar || avatar === 'null' || avatar === '') {
    return defaultAvatarUrl;
  }
  return generateStaticDataUrl(avatar);
}