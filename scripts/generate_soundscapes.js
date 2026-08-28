const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'raw');

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

// Helper to write WAV header
function createWavHeader(dataLength, sampleRate = 44100, numChannels = 2, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

// Generate rich audio loop
function generateAmbientTrack(filename, durationSec = 45, soundType = 'calm') {
  const sampleRate = 44100;
  const numChannels = 2;
  const totalSamples = sampleRate * durationSec;
  const dataSize = totalSamples * numChannels * 2; // 16-bit

  const header = createWavHeader(dataSize, sampleRate, numChannels, 16);
  const dataBuffer = Buffer.alloc(dataSize);

  let offset = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let left = 0;
    let right = 0;

    if (soundType === 'rain') {
      // Pink noise + gentle rain drops + low rumble
      const noise = (Math.random() * 2 - 1) * 0.35;
      const lowRumble = Math.sin(2 * Math.PI * 45 * t) * 0.15;
      const droplet = Math.sin(2 * Math.PI * (800 + Math.sin(t * 8) * 200) * t) * 0.04;
      left = noise + lowRumble + droplet;
      right = (Math.random() * 2 - 1) * 0.35 + lowRumble + droplet;
    } else if (soundType === 'piano') {
      // Warm chords (432Hz, 540Hz, 648Hz) with smooth tremolo
      const tremolo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.3 * t);
      const c1 = Math.sin(2 * Math.PI * 216 * t) * 0.3;
      const c2 = Math.sin(2 * Math.PI * 270 * t) * 0.25;
      const c3 = Math.sin(2 * Math.PI * 324 * t) * 0.2;
      const c4 = Math.sin(2 * Math.PI * 432 * t) * 0.15;
      const val = (c1 + c2 + c3 + c4) * tremolo;
      left = val * 0.8;
      right = val * 0.85;
    } else if (soundType === 'lofi') {
      // Warm bass + vinyl crackle + nostalgic Rhodes synth
      const bass = Math.sin(2 * Math.PI * 65 * t) * 0.4;
      const mid = Math.sin(2 * Math.PI * 260 * t) * 0.25;
      const crackle = (Math.random() > 0.992 ? (Math.random() * 2 - 1) * 0.2 : 0);
      left = bass + mid + crackle;
      right = bass + mid * 0.9 + crackle;
    } else if (soundType === 'waves') {
      // Ocean wave swell (period ~ 6 seconds)
      const swell = (Math.sin(2 * Math.PI * 0.16 * t) + 1) * 0.5;
      const foam = (Math.random() * 2 - 1) * 0.25 * swell;
      const lowSurge = Math.sin(2 * Math.PI * 55 * t) * 0.3 * swell;
      left = foam + lowSurge;
      right = (Math.random() * 2 - 1) * 0.25 * swell + lowSurge;
    } else {
      // Soothing Binaural 432Hz Meditation
      const f1 = Math.sin(2 * Math.PI * 432 * t) * 0.4;
      const f2 = Math.sin(2 * Math.PI * 436 * t) * 0.4; // 4Hz Theta beat
      left = f1;
      right = f2;
    }

    // Clamp
    left = Math.max(-1, Math.min(1, left));
    right = Math.max(-1, Math.min(1, right));

    const leftInt = Math.floor(left * 32767);
    const rightInt = Math.floor(right * 32767);

    dataBuffer.writeInt16LE(leftInt, offset);
    dataBuffer.writeInt16LE(rightInt, offset + 2);
    offset += 4;
  }

  const fullFile = Buffer.concat([header, dataBuffer]);
  fs.writeFileSync(path.join(RAW_DIR, filename), fullFile);
  console.log(`[Audio] Generated ${filename}: ${(fullFile.length / (1024 * 1024)).toFixed(2)} MB`);
}

// Generate soundscapes
const tracks = [
  { name: 'rain_loop.wav', dur: 45, type: 'rain' },
  { name: 'piano_loop.wav', dur: 45, type: 'piano' },
  { name: 'lofi_loop.wav', dur: 45, type: 'lofi' },
  { name: 'waves_loop.wav', dur: 45, type: 'waves' },
  { name: 'night_crickets.wav', dur: 40, type: 'calm' },
  { name: 'sleep_theta_432.wav', dur: 45, type: 'calm' },
  { name: 'voice_ansiedad_01.wav', dur: 35, type: 'piano' },
  { name: 'voice_ansiedad_02.wav', dur: 35, type: 'rain' },
  { name: 'voice_te_extrano_01.wav', dur: 35, type: 'lofi' },
  { name: 'voice_te_extrano_02.wav', dur: 35, type: 'piano' },
  { name: 'voice_mal_dia_01.wav', dur: 35, type: 'waves' },
  { name: 'voice_mal_dia_02.wav', dur: 35, type: 'rain' },
  { name: 'voice_reir_01.wav', dur: 30, type: 'lofi' },
  { name: 'voice_reir_02.wav', dur: 30, type: 'piano' },
];

console.log('Generating rich offline CD-quality audio tracks...');
tracks.forEach(t => generateAmbientTrack(t.name, t.dur, t.type));
console.log('All rich audio tracks generated successfully!');
