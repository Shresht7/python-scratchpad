import { display } from '../ui/output'

/** How long to wait after the last edit before updating the URL hash (in milliseconds) */
export const HASH_UPDATE_DEBOUNCE_MS = 500

/** Maximum length for the URL hash to keep shareable links usable across platforms */
const MAX_HASH_URL_LENGTH = 8192

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
        const hashUrl = `#code=${hashFragment}`

        // If the hash URL is too long, display a warning and do not update the URL
        if (hashUrl.length > MAX_HASH_URL_LENGTH) {
            console.info('Code too long to share via URL')
            display('Code too long to share via URL', { isMuted: true })
            return
        }

        history.replaceState(null, '', hashUrl)
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

/** The result of restoring code from the URL hash */
export interface HashRestoreResult {
    code: string
    warning: string | null
}

/** Restores the editor contents from a shared URL hash fragment, returning a warning if malformed */
export function restoreCodeFromHash(): HashRestoreResult {
    const match = location.hash.match(/#code=([^&]+)/)
    if (!match) return { code: '', warning: null }
    const decoded = decodeHashFragmentToCode(match[1])
    if (decoded === null) {
        console.warn('Malformed code hash in URL - ignoring')
        history.replaceState(null, '', location.pathname + location.search)
        return { code: '', warning: 'Malformed code hash in URL - ignoring' }
    }
    return { code: decoded, warning: null }
}
