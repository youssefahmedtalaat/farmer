// Helper function to generate UUID v4
// Uses Node.js built-in crypto module (available in Node 14.17.0+)
import { randomUUID } from 'crypto';

export function generateUUID() {
  return randomUUID();
}

export default generateUUID;

