import { User } from "../types";

let _user: User | null = null;
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((l) => l());
}

export const authStore = {
  getUser: () => _user,
  getToken: () => localStorage.getItem("token"),

  setAuth: (token: string, user: User) => {
    localStorage.setItem("token", token);
    _user = user;
    notify();
  },

  logout: () => {
    localStorage.removeItem("token");
    _user = null;
    notify();
  },

  setUser: (user: User) => {
    _user = user;
    notify();
  },

  subscribe: (listener: () => void) => {
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  },
};
