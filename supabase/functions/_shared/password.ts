// ============================================================================
// Temp password generator — matches DB function generate_temp_password()
// ============================================================================

const ADJECTIVES = [
  'swift', 'bright', 'bold', 'calm', 'clever', 'brave', 'eager', 'keen',
  'vivid', 'sharp', 'steady', 'smooth', 'royal', 'grand', 'prime', 'pure',
  'noble', 'quick', 'warm', 'cool', 'fresh', 'wise', 'strong', 'gentle',
  'silver', 'golden', 'cosmic', 'lunar', 'solar', 'mystic',
];

const NOUNS = [
  'panda', 'tiger', 'hawk', 'eagle', 'lion', 'otter', 'wolf', 'fox',
  'falcon', 'puma', 'leopard', 'lynx', 'raven', 'owl', 'dolphin', 'whale',
  'zebra', 'giraffe', 'koala', 'toucan', 'jaguar', 'cheetah', 'cobra', 'heron',
  'phoenix', 'griffin', 'dragon', 'sparrow', 'robin', 'swan',
];

export const generateTempPassword = (): string => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${adj}-${noun}-${num}`;
};