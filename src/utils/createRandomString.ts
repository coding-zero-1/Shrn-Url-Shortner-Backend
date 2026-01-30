import crypto from "crypto";
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function createRandomString(length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      result += BASE62[byte % 62];
    }
  }
  return result;
}

export default createRandomString;