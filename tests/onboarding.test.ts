import { describe, it, expect, vi } from 'vitest';
import { OnboardingComponent } from '../src/components/Onboarding';
import { SleepProfile } from '../src/types/sleep';

describe('OnboardingComponent Flow', () => {
  it('renders step 1 and collects answers across all 3 steps', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let completedProfile: SleepProfile | null = null;
    const onComplete = vi.fn((profile: SleepProfile) => {
      completedProfile = profile;
    });

    const onboarding = new OnboardingComponent();
    onboarding.render(container, onComplete);

    // Verify step 1 title exists
    expect(container.innerHTML).toContain('睡眠困擾');

    // Click Option 1: falling-asleep
    const option1 = container.querySelector<HTMLButtonElement>('[data-choice="falling-asleep"]');
    expect(option1).not.toBeNull();
    option1?.click();

    // Now in Step 2: duration
    expect(container.innerHTML).toContain('預計播放時長');
    const option45m = container.querySelector<HTMLButtonElement>('[data-choice="45"]');
    expect(option45m).not.toBeNull();
    option45m?.click();

    // Now in Step 3: soundscape
    expect(container.innerHTML).toContain('環境聲景');
    const optionRain = container.querySelector<HTMLButtonElement>('[data-choice="rain"]');
    expect(optionRain).not.toBeNull();
    optionRain?.click();

    // Completion callback should have fired with structured profile
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(completedProfile).not.toBeNull();
    expect(completedProfile?.issueType).toBe('falling-asleep');
    expect(completedProfile?.durationMinutes).toBe(45);
    expect(completedProfile?.soundscape).toBe('rain');
    expect(completedProfile?.beatVolume).toBe(0.7);
    expect(completedProfile?.soundscapeVolume).toBe(0.5);
  });
});
