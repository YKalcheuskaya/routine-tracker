import { describe, expect, it } from 'vitest'
import { getLocalDate, getWeekday } from './date'

describe('local date helpers', () => { it('formats a local calendar date without UTC conversion', () => expect(getLocalDate(new Date(2026, 8, 13, 23, 59))).toBe('2026-09-13')); it('gets the selected weekday', () => expect(getWeekday(new Date(2026, 8, 13))).toBe('sunday')) })
