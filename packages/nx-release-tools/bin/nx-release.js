#!/usr/bin/env node

const { NxReleaseTools } = require('../src');
const chalk = require('chalk');

const [,, command, ...args] = process.argv;

async function main() {
  const tools = new NxReleaseTools();
  
  try {
    switch (command) {
      case 'patch':
      case 'minor':
      case 'major':
        await tools.release(command);
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
  --dry-run    Run without making changes
  --skip-git   Skip git operations
  --skip-npm   Skip npm publishing

${chalk.bold('Configuration:')}
  Configure in .nx-release.json or nx-release.config.js

${chalk.bold('Examples:')}
  ${chalk.gray('# Create a patch release')}
  nx-release patch
  
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