export interface InitGeneratorSchema {
  packageManager?: 'npm' | 'pnpm' | 'yarn';
  skipGitConfig?: boolean;
}