import { base_url } from '../config/api_url_config';
import {getAvatar} from "./getUserInfo";

// auth.ts

export interface UserData {
  id: number;
  username: string;
  email: string;
  avatar: string;
  mfa: boolean;
};

export class AuthManager {
  private static _id: number | null = null;
  private static _username: string | null = null;
  private static _email: string | null = null;
  private static _avatar: string | null = null;
  private static _mfa: boolean | null = null;

  static setUser(id: number, username: string, email: string, avatar: string, mfa: boolean): void {
    this._id = id;
    this._username = username;
    this._email = email;
    this._avatar = getAvatar(avatar);
    this._mfa = mfa;
  }

  static getUser(): UserData | null {
    if (this._id && this._username && this._email && this._avatar && this._mfa !== null) {
      return {
        id: this._id,
        username: this._username,
        email: this._email,
        avatar: this._avatar,
        mfa: this._mfa,
      };
    }
    return null;
  }

  static clear(): void {
    this._id = null;
    this._username = null;
    this._email = null;
    this._avatar = null;
    this._mfa = null;
    localStorage.removeItem('jwt');
  }
};