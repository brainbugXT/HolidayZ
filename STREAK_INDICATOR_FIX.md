# Streak Indicator Fix

## Issue
The streak indicator was inconsistently checking for `>= 3` months in some places, while it should have been showing for streaks of `>= 2` consecutive months across all components.

## Changes Made

### Dashboard.tsx
Fixed two instances where the streak indicator was checking for `>= 3`:

1. **Avatar Fire Icon Badge** (Line ~299)
   - Changed from `{streak >= 3 && (`
   - Changed to `{streak >= 2 && (`
   - Shows fire icon badge on user avatars for 2+ month streaks

2. **Streak Chip Display** (Line ~333)
   - Changed from `{streak >= 3 && (`
   - Changed to `{streak >= 2 && (`
   - Shows streak chip next to user's total contribution

### PersonalStatsDialog.tsx
Fixed achievement badge display (Line ~258):

- **2-Month Streak Achievement**
  - Changed from `{stats.streak >= 3 && (`
  - Changed to `{stats.streak >= 2 && (`
  - Changed label from "3-Month Streak" to "2-Month Streak"
  - Now properly awards the achievement for 2+ consecutive months

## Streak Calculation Logic
The streak calculation in `stats.ts` (`calculateStreak` function) was already correct:
- Counts consecutive months with at least one contribution
- Returns 0 for no streak
- Returns 1 for current month only (not considered a streak for display)
- Returns 2+ for actual consecutive month streaks

## Display Logic
With this fix, the streak indicator now consistently displays:
- **No indicator**: 0-1 months (not a streak)
- **Fire icon + chip**: 2+ months (consecutive streak)
- **Special achievements**: Additional badges at 6+ months

## Verification
✅ Build completed successfully
✅ TypeScript compilation passed
✅ All streak indicators now use consistent threshold (>= 2)
✅ User experience is now uniform across Dashboard and Personal Stats

## Files Modified
1. `/src/components/Dashboard.tsx` - 2 instances fixed
2. `/src/components/PersonalStatsDialog.tsx` - 1 instance fixed

## Impact
Users will now see streak indicators as soon as they have 2 consecutive months of contributions, providing earlier positive reinforcement and better gamification feedback.
