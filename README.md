# PillPrompt

PillPrompt is a medication reminder app for seniors and their caregivers. It runs entirely on the phone, stores all data locally, and needs no accounts or subscriptions.

<img width="1920" height="1080" alt="pillprompt" src="https://github.com/user-attachments/assets/061caf4c-e450-4786-b2c4-137ecce6eac7" />


## What it does

- Lets a caregiver add medications with a name, dosage, time, and the days of the week they should be taken.
- Shows the next dose on the home screen with a countdown timer for the grace period, so the senior knows how much time they have left to confirm.
- Sends a local notification before each dose (the lead time is configurable in settings) and at the scheduled time.
- The senior can confirm a dose with a single "I TOOK IT" button, skip a dose, or leave it alone and let it be marked as missed.
- Tracks how many pills are left per medication and warns when the count drops to five or fewer.
- Keeps a dose log of everything taken, skipped, or missed, grouped by day. The log can be exported through the system share sheet.
- If the app was closed for a while, it catches up and fills in the missed doses for the days it was off, so the history stays accurate.
- Caregiver features (adding medications, settings, dose log, changing the PIN) are protected behind a 4-digit PIN.

## Technologies

- React Native 0.86 with the Expo 57 framework
- TypeScript
- React Navigation (native stack) for navigation
- expo-notifications for local reminders
- AsyncStorage for local persistence
- dayjs for date and time handling
- Expo vector icons for the interface

## Running it

```bash
npm install
npm run ios      # or: npm run android
```

All data stays on the device. There is no backend.
