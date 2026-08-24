/** How long to wait after the last edit before updating the URL hash (in milliseconds) */
export const HASH_UPDATE_DEBOUNCE_MS = 500

/** Encodes source-code into a URL-safe hash fragment using base64url encoding */
function encodeCodeToHashFragment(code: string): string {
    const bytes = new TextEncoder().encode(code)
    let binary = ''
    bytes.forEach(byte => { binary += String.fromCharCode(byte) })
    return btoa(binary)
        .replaceAll('+', '-') // Replace '+' with '-' for URL safety
        .replaceAll('/', '_') // Replace '/' with '_' for URL safety
        .replaceAll('=', '') // Remove padding characters for URL safety
}

/** Writes the editor's content into the URL hash, replacing instead of pushing history entries */
export function writeCodeToHash(code: string) {
    if (code) {
        const hashFragment = encodeCodeToHashFragment(code)
        history.replaceState(null, '', `#code=${hashFragment}`)
    } else if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search)
    }
}

/** Decodes a base64url hash fragment back into source code, returning null if it is malformed */
export function decodeHashFragmentToCode(hashFragment: string): string | null {
    try {
        const base64 = hashFragment.replaceAll('-', '+').replaceAll('_', '/')
        const binary = atob(base64)
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
        return new TextDecoder().decode(bytes)
    } catch {
        return null
    }
}
