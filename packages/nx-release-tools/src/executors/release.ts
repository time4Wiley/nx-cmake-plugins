import { ExecutorContext, logger } from '@nx/devkit';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as prompts from 'prompts';
import { ReleaseExecutorSchema } from './schema';

export default async function runExecutor(
  options: ReleaseExecutorSchema,
  context: ExecutorContext
) {
  const { versionType, dryRun = false, skipGit = false, skipNpm = false, packages } = options;
  
  // Load configuration
  const configPath = path.join(context.root, '.nx-release.json');
  let config: any = {};
  
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  
  const packageManager = config.packageManager || 'npm';
  
  try {
    if (packages && packages.length > 0) {
      logger.info(`🚀 Starting ${versionType} release for packages: ${packages.join(', ')}`);
    } else {
      logger.info(`🚀 Starting ${versionType} release for all packages...`);
    }
    
    // Step 1: Version bump
    if (!dryRun) {
      logger.info('📝 Bumping version...');
      execSync(`${packageManager} nx release version ${versionType}`, {
        stdio: 'inherit',
        cwd: context.root,
      });
    }
    
    // Step 2: Create git tags
    if (!skipGit && !dryRun) {
      logger.info('🏷️  Creating git tags...');
      await createGitTags(context.root, config, packages);
    }
    
    // Step 3: Build
    logger.info('🔨 Building packages...');
    const buildCommand = config.build?.command || `${packageManager} run build:all`;
    
    if (!dryRun) {
      execSync(buildCommand, {
        stdio: 'inherit',
        cwd: context.root,
      });
    }
    
    // Step 4: Bundle if enabled
    if (config.bundling?.enabled && !dryRun) {
      logger.info('📦 Bundling internal dependencies...');
      const bundleScript = path.join(context.root, 'scripts/bundle-imports.js');
      
      if (fs.existsSync(bundleScript)) {
        execSync(`node ${bundleScript}`, {
          stdio: 'inherit',
          cwd: context.root,
        });
      }
    }
    
    // Step 5: Publish
    if (!skipNpm && !dryRun) {
      logger.info('📦 Preparing to publish...');
      
      // Get OTP if required
      let otp = '';
      if (config.publish?.otpRequired !== false) {
        const response = await prompts({
          type: 'text',
          name: 'otp',
          message: '🔐 Enter npm OTP code:',
        });
        
        otp = response.otp;
      }
      
      // Publish packages
      logger.info('🚀 Publishing packages...');
      const publishCommand = otp 
        ? `OTP=${otp} ${packageManager} nx release publish`
        : `${packageManager} nx release publish`;
      
      execSync(publishCommand, {
        stdio: 'inherit',
        cwd: context.root,
        env: { ...process.env, OTP: otp },
      });
    }
    
    // Step 6: Push to git
    if (!skipGit && !dryRun && config.git?.push) {
      logger.info('📤 Pushing to git...');
      execSync('git push', { stdio: 'inherit', cwd: context.root });
      execSync('git push --tags', { stdio: 'inherit', cwd: context.root });
    }
    
    logger.info('🎉 Release completed successfully!');
    
    return {
      success: true,
    };
  } catch (error) {
    logger.error(`❌ Release failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
    };
  }
}

async function createGitTags(root: string, config: any, packageFilter?: string[]) {
  let packages = config.packages || [];
  
  // Filter packages if specified
  if (packageFilter && packageFilter.length > 0) {
    packages = packages.filter((pkg: any) => {
      return packageFilter.some(filter => {
        const packageName = pkg.name || path.basename(pkg.path);
        return packageName.includes(filter) || pkg.path.includes(filter);
      });
    });
  }
  
  for (const pkgConfig of packages) {
    const packagePaths = pkgConfig.path.includes('*')
      ? require('glob').sync(path.join(root, pkgConfig.path, 'package.json'))
      : [path.join(root, pkgConfig.path, 'package.json')];
    
    for (const packageJsonPath of packagePaths) {
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const tagName = `${packageJson.name}@${packageJson.version}`;
        
        try {
          execSync(
            `git tag -a "${tagName}" -m "Release ${packageJson.name} v${packageJson.version}"`,
            { stdio: 'pipe', cwd: root }
          );
          logger.info(`✅ Created tag: ${tagName}`);
        } catch (error) {
          // Tag might already exist
          logger.warn(`⚠️  Tag ${tagName} already exists`);
        }
      }
    }
  }
  
  // Commit version changes
  try {
    execSync('git add -A', { stdio: 'pipe', cwd: root });
    const commitMessage = config.git?.commitMessage?.replace('{version}', 'bump') 
      || 'chore(release): version bump [skip ci]';
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe', cwd: root });
  } catch (error) {
    logger.warn('⚠️  No changes to commit');
  }
}