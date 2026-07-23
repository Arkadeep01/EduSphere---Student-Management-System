export const appConfig = {
  mockExportMode: false,
} as const;

export function isMockExportMode(): boolean {
  return appConfig.mockExportMode;
}
