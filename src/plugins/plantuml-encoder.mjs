/**
 * PlantUML URL Encoder
 *
 * Encodes PlantUML code to URL-safe strings using the official PlantUML encoding algorithm:
 * UTF-8 → Deflate compression → Custom Base64 encoding
 */

import { deflateRawSync } from 'zlib';

// PlantUML custom Base64 character set (URL-safe)
const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

/**
 * Wraps PlantUML code with @startuml/@enduml if missing
 * @param {string} code - The PlantUML code
 * @returns {string} - The wrapped code
 */
export function wrapPlantUMLCode(code) {
  const trimmed = code.trim();
  const hasStart = trimmed.startsWith('@startuml') || trimmed.startsWith('@startmindmap') ||
                   trimmed.startsWith('@startwbs') || trimmed.startsWith('@startgantt') ||
                   trimmed.startsWith('@startsalt') || trimmed.startsWith('@startjson') ||
                   trimmed.startsWith('@startyaml') || trimmed.startsWith('@startditaa');

  if (hasStart) {
    return trimmed;
  }

  return `@startuml\n${trimmed}\n@enduml`;
}

/**
 * Encodes a 6-bit value to a PlantUML Base64 character
 * @param {number} value - 6-bit value (0-63)
 * @returns {string} - Encoded character
 */
function encode6bit(value) {
  return PLANTUML_ALPHABET[value & 0x3F];
}

/**
 * Encodes 3 bytes to 4 PlantUML Base64 characters
 * @param {number} b1 - First byte
 * @param {number} b2 - Second byte
 * @param {number} b3 - Third byte
 * @returns {string} - 4 encoded characters
 */
function encode3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;

  return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4);
}

/**
 * Encodes a buffer to PlantUML custom Base64 format
 * @param {Buffer} data - The compressed data
 * @returns {string} - Encoded string
 */
function encodePlantUMLBase64(data) {
  let result = '';
  const len = data.length;

  for (let i = 0; i < len; i += 3) {
    const b1 = data[i];
    const b2 = i + 1 < len ? data[i + 1] : 0;
    const b3 = i + 2 < len ? data[i + 2] : 0;
    result += encode3bytes(b1, b2, b3);
  }

  return result;
}

/**
 * Compresses PlantUML code using Deflate (raw)
 * @param {string} code - The PlantUML code
 * @returns {Buffer} - Compressed data
 */
export function compressCode(code) {
  const utf8Buffer = Buffer.from(code, 'utf-8');
  return deflateRawSync(utf8Buffer, { level: 9 });
}

/**
 * Encodes PlantUML code to a URL-safe string
 * @param {string} code - The PlantUML code
 * @returns {string} - Encoded string for use in PlantUML server URL
 */
export function encodePlantUML(code) {
  const wrappedCode = wrapPlantUMLCode(code);
  const compressed = compressCode(wrappedCode);
  return encodePlantUMLBase64(compressed);
}

/**
 * Generates a complete PlantUML server URL
 * @param {string} code - The PlantUML code
 * @param {Object} options - Configuration options
 * @param {string} [options.server='https://www.plantuml.com/plantuml'] - PlantUML server URL
 * @param {'svg'|'png'} [options.format='svg'] - Output format
 * @returns {string} - Complete URL
 */
export function generatePlantUMLUrl(code, options = {}) {
  const server = options.server || 'https://www.plantuml.com/plantuml';
  const format = options.format || 'svg';
  const encoded = encodePlantUML(code);

  // Remove trailing slash from server if present
  const baseUrl = server.endsWith('/') ? server.slice(0, -1) : server;

  return `${baseUrl}/${format}/${encoded}`;
}
