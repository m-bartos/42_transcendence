import { base_url } from '../config/api_url_config';
import {getAvatar} from "./getUserInfo";

// auth.ts

export interface UserData {
  id: number;
  username: string;
  email: string;
  avatar: string;
};

export class AuthManager {
  private static _id: number | null = null;
  private static _username: string | null = null;
  private static _email: string | null = null;
  private static _avatar: string | null = null;

  static setUser(id: number, username: string, email: string, avatar: string): void {
    this._id = id;
    this._username = username;
    this._email = email;
    this._avatar = getAvatar(avatar);
  }

  static getUser(): UserData | null {
    if (this._id && this._username && this._email && this._avatar) {
      return {
        id: this._id,
        username: this._username,
        email: this._email,
        avatar: this._avatar,
      };
    }
    return null;
  }

  static clear(): void {
    this._id = null;
    this._username = null;
    this._email = null;
    this._avatar = null;
    localStorage.removeItem('jwt');
  }
};