export interface ReleaseExecutorSchema {
  versionType: 'patch' | 'minor' | 'major';
  dryRun?: boolean;
  skipGit?: boolean;
  skipNpm?: boolean;
  packages?: string[];
}