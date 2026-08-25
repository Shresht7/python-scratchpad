/** Returns the platform-appropriate modifier key label */
export function getModifierKey(): string {
    return navigator.userAgent.includes('Mac') ? 'Cmd' : 'Ctrl'
}
