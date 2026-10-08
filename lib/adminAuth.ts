import {
  createHmac,
  timingSafeEqual,
} from "crypto";

const ADMIN_COOKIE_NAME = "cr-wed-darts-admin";

function getAdminPin() {
  const adminPin = process.env.ADMIN_PIN;

  if (!adminPin) {
    throw new Error(
      "ADMIN_PIN environment variable is missing."
    );
  }

  return adminPin;
}

export function createAdminToken() {
  return createHmac("sha256", getAdminPin())
    .update("cr-wed-darts-admin-session")
    .digest("hex");
}

export function verifyAdminToken(
  suppliedToken: string | undefined
) {
  if (!suppliedToken) {
    return false;
  }

  const expectedToken = createAdminToken();

  const suppliedBuffer = Buffer.from(suppliedToken);
  const expectedBuffer = Buffer.from(expectedToken);

  if (
    suppliedBuffer.length !== expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    suppliedBuffer,
    expectedBuffer
  );
}

export function verifyAdminPin(
  suppliedPin: string
) {
  const realPin = getAdminPin();

  const suppliedBuffer = Buffer.from(suppliedPin);
  const realBuffer = Buffer.from(realPin);

  if (
    suppliedBuffer.length !== realBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    suppliedBuffer,
    realBuffer
  );
}

export { ADMIN_COOKIE_NAME };