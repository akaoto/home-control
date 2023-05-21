class CacheServer {
    static get(key) {
        const value = CacheServer.CACHE.get(key);
        return JSON.parse(value);
    }

    static getAll() {
        const keys = CacheServer.get('keys');
        let values = {};
        if (keys) {
            keys.forEach(key => {
                if (key != 'keys') {
                    values[key] = CacheServer.get(key)
                }
            });
        }
        return values;
    }

    static put(key, value) {
        CacheServer.CACHE.put(key, JSON.stringify(value), CacheServer.EXPIRATION_TIME);
        CacheServer._addKey(key);
    }

    static refresh() {
        CacheServer.get("keys").forEach(key => CacheServer.put(key, CacheServer.get(key)));
    }

    static _addKey(key) {
        let keys = CacheServer.get('keys') || ['keys'];
        if (!keys.includes(key)) {
            keys.push(key);
            CacheServer.put('keys', keys);
        }
    }
}

CacheServer.CACHE = CacheService.getScriptCache();
CacheServer.EXPIRATION_TIME = 600;
