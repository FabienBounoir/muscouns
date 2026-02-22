import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

class Crypter {
    #separator;

    /**
     * @param {string} separator
     */
    constructor(separator) {
        this.#separator = separator;
    }

    /**
     * @param {string} password
     */
    async hash(password) {
        const salt = randomBytes(8).toString("hex");
        const derivedKey = scryptSync(password, salt, 64);

        return salt + this.#separator + derivedKey.toString("hex");
    }

    /**
     * @param {string} password
     * @param {string} hash
     */
    async verify(password, hash) {
        const [salt, key] = hash.split(this.#separator);
        if (!salt || !key) {
            return false;
        }

        const keyBuffer = Buffer.from(key, "hex");
        const derivedKey = scryptSync(password, salt, 64);

        return timingSafeEqual(keyBuffer, derivedKey);
    }
}

export const crypter = new Crypter("°");
