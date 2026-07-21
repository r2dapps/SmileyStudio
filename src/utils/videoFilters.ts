export interface VideoFilterOption {
  id: string;
  name: string;
  cssFilter: string;
}

export const VIDEO_FILTERS: VideoFilterOption[] = [
  { id: 'none', name: 'Clean Natural', cssFilter: 'none' },
  { id: 'neon', name: 'Neon Pink Glow', cssFilter: 'contrast(1.25) saturate(1.6) hue-rotate(290deg)' },
  { id: 'vintage', name: 'Vintage Retro', cssFilter: 'sepia(0.55) contrast(1.15) brightness(0.95)' },
  { id: 'dramatic', name: 'B&W Dramatic', cssFilter: 'grayscale(1.0) contrast(1.4)' },
  { id: 'sunset', name: 'Warm Sunset', cssFilter: 'sepia(0.35) hue-rotate(330deg) saturate(1.5)' },
  { id: 'cyberpunk', name: 'Cyberpunk Violet', cssFilter: 'contrast(1.3) saturate(1.7) hue-rotate(230deg)' },
];
