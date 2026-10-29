import { SoundscapeType } from '../types/sleep';

/**
 * Creates audio buffers for ambient soundscapes programmatically
 * so the application requires zero external audio asset files and works 100% offline.
 */
export class NoiseGenerator {
  /**
   * Generates a 5-second seamless loopable buffer for the specified soundscape.
   */
  static createSoundscapeBuffer(ctx: AudioContext, type: SoundscapeType): AudioBuffer | null {
    if (type === 'silent') return null;

    const sampleRate = ctx.sampleRate;
    const duration = 5.0; // 5 seconds buffer, looped seamlessly
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    switch (type) {
      case 'pink-noise':
        this.generatePinkNoise(left, length);
        this.generatePinkNoise(right, length);
        break;
      case 'brown-noise':
        this.generateBrownNoise(left, length);
        this.generateBrownNoise(right, length);
        break;
      case 'rain':
        this.generateRainNoise(left, length, sampleRate);
        this.generateRainNoise(right, length, sampleRate);
        break;
      case 'fireplace':
        this.generateFireplaceNoise(left, length, sampleRate);
        this.generateFireplaceNoise(right, length, sampleRate);
        break;
    }

    // Apply seamless crossfade at the ends of the buffer
    this.applyCrossfade(left, length, Math.floor(sampleRate * 0.1));
    this.applyCrossfade(right, length, Math.floor(sampleRate * 0.1));

    return buffer;
  }

  private static generatePinkNoise(channel: Float32Array, length: number): void {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      channel[i] = pink * 0.05; // normalize volume
    }
  }

  private static generateBrownNoise(channel: Float32Array, length: number): void {
    let lastOut = 0.0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      channel[i] = lastOut * 0.35;
    }
  }

  private static generateRainNoise(channel: Float32Array, length: number, sampleRate: number): void {
    // Rain is filtered pink noise with random soft droplet impulses
    this.generatePinkNoise(channel, length);
    // Add soft water droplet texture
    const dropletInterval = Math.floor(sampleRate * 0.05);
    for (let i = 0; i < length; i += dropletInterval) {
      if (Math.random() > 0.4) {
        const dropLen = Math.floor(sampleRate * 0.01);
        const amp = (Math.random() * 0.04) + 0.01;
        for (let j = 0; j < dropLen && i + j < length; j++) {
          channel[i + j] += Math.sin((j / dropLen) * Math.PI) * (Math.random() * amp);
        }
      }
    }
  }

  private static generateFireplaceNoise(channel: Float32Array, length: number, sampleRate: number): void {
    // Fireplace has warm brown rumble + occasional subtle wood pop
    this.generateBrownNoise(channel, length);
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.00015) {
        // Crackle impulse
        const crackleDuration = Math.floor(sampleRate * 0.003);
        const crackleAmp = 0.08 + Math.random() * 0.07;
        for (let j = 0; j < crackleDuration && i + j < length; j++) {
          channel[i + j] += (Math.random() * 2 - 1) * crackleAmp * (1 - j / crackleDuration);
        }
      }
    }
  }

  private static applyCrossfade(channel: Float32Array, length: number, fadeSamples: number): void {
    for (let i = 0; i < fadeSamples; i++) {
      const ratio = i / fadeSamples;
      // Blend end into start smoothly
      const startVal = channel[i];
      const endVal = channel[length - fadeSamples + i];
      channel[i] = startVal * ratio + endVal * (1 - ratio);
      channel[length - fadeSamples + i] = endVal * ratio + startVal * (1 - ratio);
    }
  }
}
