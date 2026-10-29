import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MorningModal } from '../src/components/MorningModal';
import { StorageService } from '../src/utils/storage';

describe('Morning Checkin Modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('determines shouldShow correctly based on storage', () => {
    expect(MorningModal.shouldShow()).toBe(true);
    StorageService.saveCheckin(4, '很好');
    expect(MorningModal.shouldShow()).toBe(false);
  });

  it('renders modal and handles check-in save', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const onDone = vi.fn();
    const modal = new MorningModal();
    modal.render(container, onDone);

    expect(container.innerHTML).toContain('昨夜睡得還好嗎？');

    // Click 4-star button
    const star4 = container.querySelector<HTMLButtonElement>('[data-star="4"]');
    star4?.click();

    // Click save button
    const saveBtn = container.querySelector<HTMLButtonElement>('#btn-save-checkin');
    saveBtn?.click();

    expect(onDone).toHaveBeenCalledTimes(1);
    expect(StorageService.hasCheckedInToday()).toBe(true);
    expect(StorageService.getCheckinHistory()[0].stars).toBe(4);
  });
});
