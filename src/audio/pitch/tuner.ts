export interface PitchResult {
  frequency: number;
  note: string;
  cents: number;
}

const NOTE_STRINGS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getPitchDetails(frequency: number): PitchResult {
  if (frequency <= 0) {
    return { frequency: 0, note: '--', cents: 0 };
  }

  // A4 = 440 Hz -> MIDI Note 69
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;
  const midiNote = Math.round(noteNum);
  const noteName = NOTE_STRINGS[midiNote % 12];
  const octave = Math.floor(midiNote / 12) - 1;

  // Calculate cents offset (-50 to +50)
  const exactFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
  const cents = Math.floor(1200 * (Math.log(frequency / exactFreq) / Math.log(2)));

  return {
    frequency: Math.round(frequency),
    note: `${noteName}${octave}`,
    cents: Math.max(-50, Math.min(50, cents)),
  };
}
