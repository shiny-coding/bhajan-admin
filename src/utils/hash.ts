export async function hashToken(writeTokenHash: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(writeTokenHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
} 