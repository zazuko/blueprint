import { Injectable } from '@angular/core';

const localStorageAuthKey = 'com.zazuko.blueprint.bp-auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private credentials: Credentials | null = null;

  constructor() {
    const credentials = this.readSessionStorage();
    if (credentials !== null) {
      this.credentials = credentials;
    }
  }

  public isAuthenticated(): boolean {
    return this.credentials !== null;
  }

  public getCredentials(): Credentials | null {
    return this.credentials;
  }

  public updateCredentials(credentials: Credentials | null) {
    this.credentials = credentials;
    if (credentials === null) {
      this.removeSessionStorage();
    } else {
      this.writeSessionStorage();
    }
  }

  private readSessionStorage(): Credentials | null {
    const sessionStorageData = sessionStorage.getItem(localStorageAuthKey);
    if (sessionStorageData === null) {
      return null;
    }
    const credentialsFromStore = JSON.parse(sessionStorageData);
    const username = credentialsFromStore.username;
    const password = credentialsFromStore.password;

    if (username === undefined || password === undefined) {
      return null;
    }

    return {
      username,
      password
    };
  }

  private writeSessionStorage() {
    if (this.credentials === null) {
      this.readSessionStorage();
    }
    sessionStorage.setItem(localStorageAuthKey, JSON.stringify({
      username: this.credentials.username,
      password: this.credentials.password
    }));
  }



  public signOut() {
    this.readSessionStorage();
  }

  private removeSessionStorage() {
    sessionStorage.removeItem(localStorageAuthKey);
  }
}


export interface Credentials {
  username: string;
  password: string;
}