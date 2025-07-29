#!/usr/bin/env node

const { NxReleaseTools } = require('../src');
const chalk = require('chalk');

const [,, command, ...args] = process.argv;

// Parse package filter from args
const packageIndex = args.findIndex(arg => arg === '--packages' || arg === '-p');
const packages = packageIndex !== -1 && args[packageIndex + 1] 
  ? args[packageIndex + 1].split(',')
  : undefined;

async function main() {
  const tools = new NxReleaseTools();
  
  try {
    switch (command) {
      case 'patch':
      case 'minor':
      case 'major':
        await tools.release(command, { packages });
        break;
      
      case 'init':
        await tools.init();
        break;
      
      case 'version':
      case '--version':
      case '-v':
        const pkg = require('../package.json');
        console.log(pkg.version);
        break;
      
      case 'help':
      case '--help':
      case '-h':
      case undefined:
        console.log(`
${chalk.bold('nx-release')} - Automated release tools for Nx monorepos

${chalk.bold('Usage:')}
  nx-release <command> [options]

${chalk.bold('Commands:')}
  ${chalk.cyan('patch')}    Create a patch release (0.0.x)
  ${chalk.cyan('minor')}    Create a minor release (0.x.0)
  ${chalk.cyan('major')}    Create a major release (x.0.0)
  ${chalk.cyan('init')}     Initialize release configuration

${chalk.bold('Options:')}
  --dry-run             Run without making changes
  --skip-git            Skip git operations
  --skip-npm            Skip npm publishing
  --packages, -p        Specific packages to release (comma-separated)

${chalk.bold('Configuration:')}
  Configure in .nx-release.json or nx-release.config.js

${chalk.bold('Examples:')}
  ${chalk.gray('# Create a patch release for all packages')}
  nx-release patch
  
  ${chalk.gray('# Release specific packages only')}
  nx-release patch --packages package-a,package-b
  
  ${chalk.gray('# Initialize configuration')}
  nx-release init
        `);
        break;
      
      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        console.log('Run "nx-release --help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();