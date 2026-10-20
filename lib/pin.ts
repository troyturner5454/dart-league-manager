import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const MIN_PIN_LENGTH = 4;
export const MAX_PIN_LENGTH = 20;

export function pinFormatOk(pin: string) {
  return pin.length >= MIN_PIN_LENGTH && pin.length <= MAX_PIN_LENGTH;
}

export const PIN_FORMAT_MESSAGE = `PIN must be ${MIN_PIN_LENGTH} to ${MAX_PIN_LENGTH} characters.`;

export function isHashedPin(stored: string) {
  return stored.startsWith("scrypt$");
}

/** Returns "scrypt$<salt>$<hash>" - the PIN itself is never stored. */
export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

/** Checks a PIN against a stored hash. Old plain-text PINs are still accepted
 *  (and upgraded by the login route) so existing test players keep working. */
export function verifyPin(pin: string, stored: string) {
  if (isHashedPin(stored)) {
    const [, salt, hash] = stored.split("$");
    if (!salt || !hash) return false;
    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(pin, salt, expected.length);
    return timingSafeEqual(actual, expected);
  }
  const a = Buffer.from(pin);
  const b = Buffer.from(stored);
  return a.length === b.length && timingSafeEqual(a, b);
}
