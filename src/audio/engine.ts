import { BrainwaveBand, SleepProfile, SoundscapeType } from '../types/sleep';
import { calculateFrequencies, getFadeGain } from './math';
import { NoiseGenerator } from './noise';

export type EngineStatus = 'idle' | 'playing' | 'paused';

export interface EngineState {
  status: EngineStatus;
  elapsedSeconds: number;
  totalSeconds: number;
  remainingSeconds: number;
  currentCarrierFreq: number;
  currentBeatFreq: number;
  currentBand: BrainwaveBand;
  beatVolume: number;
  soundscapeVolume: number;
  soundscapeTrack: SoundscapeType;
  fadeGain: number;
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private status: EngineStatus = 'idle';

  // Audio nodes for Track 1: Monaural Beats AM
  private carrierOsc: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private beatGain: GainNode | null = null;

  // Audio nodes for Track 2: Soundscapes
  private soundscapeSource: AudioBufferSourceNode | null = null;
  private soundscapeGain: GainNode | null = null;

  // Master Gain & Output
  private masterGain: GainNode | null = null;

  // State & Timers
  private profile: SleepProfile | null = null;
  private elapsedSeconds = 0;
  private totalSeconds = 1800;
  private beatVolume = 0.7;
  private soundscapeVolume = 0.5;
  private currentTrack: SoundscapeType = 'pink-noise';
  private currentBand: BrainwaveBand = 'Alpha';
  private currentCarrier = 120;
  private currentBeat = 10;
  private timerId: number | null = null;
  private tickCallbacks: Array<(state: EngineState) => void> = [];

  constructor() {
    // Lazy AudioContext initialization on user gesture
  }

  public async init(): Promise<void> {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    }
  }

  public start(profile: SleepProfile): void {
    this.stop();
    this.profile = profile;
    this.beatVolume = profile.beatVolume;
    this.soundscapeVolume = profile.soundscapeVolume;
    this.currentTrack = profile.soundscape;
    this.totalSeconds = profile.durationMinutes * 60;
    this.elapsedSeconds = 0;
    this.status = 'playing';

    if (this.ctx && this.ctx.state === 'running') {
      this.setupAudioGraph();
    }

    this.updateFrequencies();
    this.startTimer();
  }

  public stop(): void {
    this.status = 'idle';
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.teardownAudioGraph();
    this.notifyTick();
  }

  public pause(): void {
    if (this.status !== 'playing') return;
    this.status = 'paused';
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    this.notifyTick();
  }

  public resume(): void {
    if (this.status !== 'paused') return;
    this.status = 'playing';
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.notifyTick();
  }

  public setBeatVolume(val: number): void {
    this.beatVolume = Math.max(0, Math.min(1, val));
    if (this.beatGain && this.ctx) {
      this.beatGain.gain.setValueAtTime(this.beatVolume, this.ctx.currentTime);
    }
  }

  public setSoundscapeVolume(val: number): void {
    this.soundscapeVolume = Math.max(0, Math.min(1, val));
    if (this.soundscapeGain && this.ctx) {
      this.soundscapeGain.gain.setValueAtTime(this.soundscapeVolume, this.ctx.currentTime);
    }
  }

  public setSoundscapeTrack(trackId: SoundscapeType): void {
    this.currentTrack = trackId;
    if (this.status === 'playing' && this.ctx) {
      this.restartSoundscapeTrack();
    }
  }

  public onTick(cb: (state: EngineState) => void): void {
    this.tickCallbacks.push(cb);
  }

  public getState(): EngineState {
    const remaining = Math.max(0, this.totalSeconds - this.elapsedSeconds);
    const fade = getFadeGain(remaining, 600);
    return {
      status: this.status,
      elapsedSeconds: this.elapsedSeconds,
      totalSeconds: this.totalSeconds,
      remainingSeconds: remaining,
      currentCarrierFreq: this.currentCarrier,
      currentBeatFreq: this.currentBeat,
      currentBand: this.currentBand,
      beatVolume: this.beatVolume,
      soundscapeVolume: this.soundscapeVolume,
      soundscapeTrack: this.currentTrack,
      fadeGain: fade
    };
  }

  private setupAudioGraph(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, now);
    this.masterGain.connect(this.ctx.destination);

    // Track 1: Monaural Beat (AM Synthesis: Carrier * (1 + Modulation))
    // Carrier
    this.carrierOsc = this.ctx.createOscillator();
    this.carrierOsc.type = 'sine';
    this.carrierOsc.frequency.setValueAtTime(this.currentCarrier, now);

    // AM Modulator (LFO)
    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.setValueAtTime(this.currentBeat, now);

    // Modulation depth gain
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(0.5, now); // modulation depth m = 0.5

    // AM Gain node that modulates carrier amplitude
    const amGain = this.ctx.createGain();
    amGain.gain.setValueAtTime(0.5, now);
    this.lfoGain.connect(amGain.gain);

    // Beat Track volume
    this.beatGain = this.ctx.createGain();
    this.beatGain.gain.setValueAtTime(this.beatVolume, now);

    // Route: Carrier -> AM Gain -> Beat Gain -> Master Gain
    this.carrierOsc.connect(amGain);
    amGain.connect(this.beatGain);
    this.beatGain.connect(this.masterGain);

    this.carrierOsc.start(now);
    this.lfoOsc.start(now);

    // Track 2: Soundscape
    this.soundscapeGain = this.ctx.createGain();
    this.soundscapeGain.gain.setValueAtTime(this.soundscapeVolume, now);
    this.soundscapeGain.connect(this.masterGain);

    this.restartSoundscapeTrack();
  }

  private restartSoundscapeTrack(): void {
    if (!this.ctx || !this.soundscapeGain) return;

    if (this.soundscapeSource) {
      try {
        this.soundscapeSource.stop();
        this.soundscapeSource.disconnect();
      } catch {
        // ignore
      }
      this.soundscapeSource = null;
    }

    const buffer = NoiseGenerator.createSoundscapeBuffer(this.ctx, this.currentTrack);
    if (buffer) {
      this.soundscapeSource = this.ctx.createBufferSource();
      this.soundscapeSource.buffer = buffer;
      this.soundscapeSource.loop = true;
      this.soundscapeSource.connect(this.soundscapeGain);
      this.soundscapeSource.start();
    }
  }

  private teardownAudioGraph(): void {
    try {
      this.carrierOsc?.stop();
      this.carrierOsc?.disconnect();
      this.lfoOsc?.stop();
      this.lfoOsc?.disconnect();
      this.soundscapeSource?.stop();
      this.soundscapeSource?.disconnect();
      this.masterGain?.disconnect();
    } catch {
      // ignore
    }
    this.carrierOsc = null;
    this.lfoOsc = null;
    this.lfoGain = null;
    this.beatGain = null;
    this.soundscapeSource = null;
    this.soundscapeGain = null;
    this.masterGain = null;
  }

  private startTimer(): void {
    if (this.timerId !== null) clearInterval(this.timerId);
    this.timerId = window.setInterval(() => {
      if (this.status !== 'playing') return;

      this.elapsedSeconds++;
      this.updateFrequencies();

      const remaining = Math.max(0, this.totalSeconds - this.elapsedSeconds);
      const fade = getFadeGain(remaining, 600);

      // Apply fade gain smoothly to master gain
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(fade, this.ctx.currentTime);
      }

      this.notifyTick();

      // If time completed, auto-stop peacefully
      if (remaining <= 0) {
        this.stop();
      }
    }, 1000);
  }

  private updateFrequencies(): void {
    if (!this.profile) return;
    const res = calculateFrequencies(this.profile.issueType, this.elapsedSeconds, this.totalSeconds);
    this.currentCarrier = res.carrier;
    this.currentBeat = res.beat;
    this.currentBand = res.band;

    if (this.carrierOsc && this.lfoOsc && this.ctx) {
      this.carrierOsc.frequency.setValueAtTime(this.currentCarrier, this.ctx.currentTime);
      this.lfoOsc.frequency.setValueAtTime(this.currentBeat, this.ctx.currentTime);
    }
  }

  private notifyTick(): void {
    const state = this.getState();
    for (const cb of this.tickCallbacks) {
      try {
        cb(state);
      } catch (err) {
        console.error('Tick callback error', err);
      }
    }
  }
}
