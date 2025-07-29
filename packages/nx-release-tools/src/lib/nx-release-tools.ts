import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as prompts from 'prompts';
import * as chalk from 'chalk';

export class NxReleaseTools {
  private config: any;
  private packageManager: string;
  private workspaceRoot: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
    this.config = this.loadConfig();
    this.packageManager = this.config.packageManager || 'npm';
  }

  private loadConfig(): any {
    const configPaths = [
      '.nx-release.json',
      'nx-release.config.js',
      'nx-release.config.json',
    ];

    for (const configPath of configPaths) {
      const fullPath = path.join(this.workspaceRoot, configPath);
      if (fs.existsSync(fullPath)) {
        return configPath.endsWith('.js')
          ? require(fullPath)
          : JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      }
    }

    return {}; // Default config
  }

  async release(versionType: 'patch' | 'minor' | 'major'): Promise<void> {
    console.log(chalk.cyan(`🚀 Starting ${versionType} release...`));

    try {
      // Step 1: Version bump
      await this.bumpVersion(versionType);

      // Step 2: Build
      await this.build();

      // Step 3: Bundle (if enabled)
      if (this.config.bundling?.enabled) {
        await this.bundle();
      }

      // Step 4: Git operations
      if (this.config.git?.tags) {
        await this.createGitTags();
      }

      // Step 5: Publish with OTP
      await this.publishWithOTP();

      // Step 6: Push to git
      if (this.config.git?.push) {
        await this.pushToGit();
      }

      console.log(chalk.green('🎉 Release completed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Release failed:'), error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async bumpVersion(versionType: string): Promise<void> {
    console.log(chalk.blue('📝 Bumping version...'));
    
    try {
      execSync(`${this.packageManager} nx release version ${versionType}`, {
        stdio: 'inherit',
        cwd: this.workspaceRoot,
      });
    } catch (error) {
      // If nx release fails, try npm version
      console.log(chalk.yellow('Nx release not available, using npm version...'));
      execSync(`npm version ${versionType} --no-git-tag-version`, {
        stdio: 'inherit',
        cwd: this.workspaceRoot,
      });
    }
  }

  private async build(): Promise<void> {
    console.log(chalk.blue('🔨 Building packages...'));
    const buildCommand = this.config.build?.command || `${this.packageManager} run build`;
    execSync(buildCommand, {
      stdio: 'inherit',
      cwd: this.workspaceRoot,
    });
  }

  private async bundle(): Promise<void> {
    console.log(chalk.blue('📦 Bundling dependencies...'));

    const bundleScript = path.join(this.workspaceRoot, 'scripts/bundle-imports.js');
    if (fs.existsSync(bundleScript)) {
      execSync(`node ${bundleScript}`, {
        stdio: 'inherit',
        cwd: this.workspaceRoot,
      });
    } else if (this.config.bundling?.script) {
      execSync(this.config.bundling.script, {
        stdio: 'inherit',
        cwd: this.workspaceRoot,
      });
    } else {
      console.log(chalk.yellow('No bundling script found, skipping...'));
    }
  }

  private async createGitTags(): Promise<void> {
    console.log(chalk.blue('🏷️  Creating git tags...'));

    const packages = this.config.packages || this.detectPackages();

    for (const pkg of packages) {
      const packagePaths = this.resolvePackagePaths(pkg);
      
      for (const packagePath of packagePaths) {
        const packageJsonPath = path.join(packagePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const tagName = `${packageJson.name}@${packageJson.version}`;

          try {
            execSync(`git tag -a "${tagName}" -m "Release ${packageJson.name} v${packageJson.version}"`, {
              stdio: 'pipe',
              cwd: this.workspaceRoot,
            });
            console.log(chalk.green(`✅ Created tag: ${tagName}`));
          } catch {
            console.log(chalk.yellow(`⚠️  Tag ${tagName} already exists`));
          }
        }
      }
    }

    // Commit version changes
    try {
      execSync('git add -A', { stdio: 'pipe', cwd: this.workspaceRoot });
      const commitMessage = this.config.git?.commitMessage || 'chore(release): version bump [skip ci]';
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe', cwd: this.workspaceRoot });
    } catch {
      console.log(chalk.yellow('⚠️  No changes to commit'));
    }
  }

  private async publishWithOTP(): Promise<void> {
    console.log(chalk.blue('📦 Preparing to publish...'));

    // Get OTP at the last moment
    let otp = '';
    if (this.config.publish?.otpRequired !== false) {
      const response = await prompts({
        type: 'text',
        name: 'otp',
        message: '🔐 Enter npm OTP:',
      });
      otp = response.otp;
    }

    console.log(chalk.blue('🚀 Publishing packages...'));
    
    try {
      const publishCommand = `${this.packageManager} nx release publish`;
      execSync(publishCommand, {
        stdio: 'inherit',
        cwd: this.workspaceRoot,
        env: { ...process.env, OTP: otp },
      });
    } catch (error) {
      // If nx release publish fails, try direct npm publish
      console.log(chalk.yellow('Trying direct npm publish...'));
      const packages = this.config.packages || this.detectPackages();
      
      for (const pkg of packages) {
        const distPaths = pkg.distPath ? [pkg.distPath] : [pkg.path];
        for (const distPath of distPaths) {
          const publishCmd = `npm publish ${distPath} --otp=${otp}`;
          execSync(publishCmd, {
            stdio: 'inherit',
            cwd: this.workspaceRoot,
          });
        }
      }
    }
  }

  private async pushToGit(): Promise<void> {
    console.log(chalk.blue('📤 Pushing to git...'));
    execSync('git push', { stdio: 'inherit', cwd: this.workspaceRoot });
    execSync('git push --tags', { stdio: 'inherit', cwd: this.workspaceRoot });
  }

  async init(): Promise<void> {
    console.log(chalk.cyan('🔧 Initializing nx-release configuration...'));
    
    // Create default config
    const defaultConfig = {
      packageManager: this.packageManager,
      packages: [
        {
          name: '*',
          path: 'packages/*',
          distPath: 'dist/packages/*',
        },
      ],
      git: {
        tags: true,
        push: true,
        commitMessage: 'chore(release): release version {version} [skip ci]',
      },
      bundling: {
        enabled: false,
        aliases: {},
      },
      build: {
        command: `${this.packageManager} run build:all`,
      },
      publish: {
        registry: 'https://registry.npmjs.org',
        access: 'public',
        otpRequired: true,
      },
    };

    const configPath = path.join(this.workspaceRoot, '.nx-release.json');
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    
    console.log(chalk.green('✅ Created .nx-release.json'));
    
    // Create scripts directory
    const scriptsDir = path.join(this.workspaceRoot, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    console.log(chalk.green('✅ Configuration initialized!'));
  }

  private detectPackages(): any[] {
    // Auto-detect packages from workspace
    const packagesPath = path.join(this.workspaceRoot, 'packages');
    if (fs.existsSync(packagesPath)) {
      const packages = fs.readdirSync(packagesPath)
        .filter(dir => {
          const pkgJsonPath = path.join(packagesPath, dir, 'package.json');
          return fs.existsSync(pkgJsonPath);
        })
        .map(dir => ({
          name: dir,
          path: path.join('packages', dir),
          distPath: path.join('dist/packages', dir),
        }));
      
      return packages;
    }
    
    return [];
  }

  private resolvePackagePaths(pkg: any): string[] {
    const basePath = path.join(this.workspaceRoot, pkg.path);
    
    if (pkg.path.includes('*')) {
      // Handle glob patterns
      const pattern = pkg.path.replace('*', '');
      const parentDir = path.join(this.workspaceRoot, pattern);
      
      if (fs.existsSync(parentDir)) {
        return fs.readdirSync(parentDir)
          .map(dir => path.join(parentDir, dir))
          .filter(dir => fs.statSync(dir).isDirectory());
      }
    }
    
    return [basePath];
  }
}