export const appConfig = {
  mockExportMode: true,
} as const;

export function isMockExportMode(): boolean {
  return appConfig.mockExportMode;
}
