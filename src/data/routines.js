/**
 * Fictional starter content for a clean first launch and for the explicit
 * "Restore demo routines" action. Runtime edits are stored separately in the
 * versioned tracker record; this module is not a user-data database.
 */
const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const routines = [
  {
    id: 'am-care', category: 'care', period: 'am', weekdays: allDays,
    title: 'Gentle start', description: 'A small reset before the day begins.',
    steps: [
      { id: 'open-window', title: 'Open a window', detail: 'Take a moment for fresh air.' },
      { id: 'water-break', title: 'Pour a glass of water', detail: 'Keep it nearby for the first hour.' },
      { id: 'ready-space', title: 'Set up a welcoming space', detail: 'Clear one small surface.' },
    ],
  },
  {
    id: 'am-move', category: 'move', period: 'am', weekdays: allDays,
    title: 'Wake-up movement', description: 'A short, pressure-free way to get moving.',
    steps: [
      { id: 'stretch', title: 'Stretch for a few minutes' },
      { id: 'walk', title: 'Take a short walk or move to music' },
    ],
  },
  {
    id: 'am-focus', category: 'focus', period: 'am', weekdays: allDays,
    title: 'Day ahead', description: 'Choose a calm, realistic direction for today.',
    steps: [
      { id: 'top-priority', title: 'Write one priority' },
      { id: 'first-step', title: 'Name the first small step' },
      { id: 'focus-block', title: 'Reserve a focus block' },
    ],
  },
  {
    id: 'pm-care', category: 'care', period: 'pm', weekdays: allDays,
    title: 'Soft landing', description: 'Close the day with a little care for your space.',
    steps: [
      { id: 'put-away', title: 'Put away three things' },
      { id: 'comfort', title: 'Choose one comforting activity' },
    ],
  },
  {
    id: 'pm-move', category: 'move', period: 'pm', weekdays: allDays,
    title: 'Unwind movement', description: 'Let the day slow down at your own pace.',
    steps: [
      { id: 'easy-move', title: 'Do an easy movement break' },
      { id: 'screen-break', title: 'Step away from a screen for five minutes' },
    ],
  },
  {
    id: 'pm-focus', category: 'focus', period: 'pm', weekdays: allDays,
    title: 'Kind review', description: 'Notice what moved forward and make tomorrow easier.',
    steps: [
      { id: 'win', title: 'Record one win from today' },
      { id: 'tomorrow', title: 'Prepare one thing for tomorrow' },
      { id: 'close-tabs', title: 'Close the day’s open tabs' },
    ],
  },
]

export const categoryMeta = {
  care: { label: 'Care', icon: '✦' },
  move: { label: 'Move', icon: '↗' },
  focus: { label: 'Focus', icon: '◌' },
}
