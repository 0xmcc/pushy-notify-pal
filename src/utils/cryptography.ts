export function generateSalt(): Uint8Array {
  const salt = new Uint8Array(32);
  crypto.getRandomValues(salt);
  return salt;
}

export async function createCommitment(move: number, salt: Uint8Array): Promise<Uint8Array> {
  // Convert move to bytes first
  const moveBytes = new Uint8Array([move]);

  // Combine move bytes with salt
  const combinedArray = new Uint8Array(moveBytes.length + salt.length);
  combinedArray.set(moveBytes);
  combinedArray.set(salt, moveBytes.length);

  // Create SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', combinedArray);
  return new Uint8Array(hashBuffer);
}
