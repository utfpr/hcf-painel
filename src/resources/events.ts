export type Events = {
    'http.unauthorized': () => void
    'cookie.updated': (event: { name: string }) => void
    'cookie.removed': (event: { name: string }) => void
    'local_storage.updated': (event: { key: string }) => void
    'local_storage.removed': (event: { key: string }) => void
    'userNameUpdated': () => void
}
