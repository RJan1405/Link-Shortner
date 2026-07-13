export const AUTH_CHANGE_EVENT = 'auth-change'

export function emitAuthChange() {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}