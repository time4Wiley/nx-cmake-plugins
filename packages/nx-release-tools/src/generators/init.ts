import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
  updateJson,
  readProjectConfiguration,
  logger,
  workspaceRoot,
} from '@nx/devkit';
import * as path from 'path';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(
  tree: Tree,
  options: InitGeneratorSchema
) {
  const { packageManager = 'npm', skipGitConfig = false } = options;

  // Add release configuration to nx.json
  updateJson(tree, 'nx.json', (nxJson) => {
    // Add release tools plugin if not present
    if (!nxJson.plugins) {
      nxJson.plugins = [];
    }
    
    const hasReleaseTools = nxJson.plugins.some((plugin: any) => 
      typeof plugin === 'string' 
        ? plugin === '@nx-cmake/release-tools'
        : plugin.plugin === '@nx-cmake/release-tools'
    );
    
    if (!hasReleaseTools) {
      nxJson.plugins.push({
        plugin: '@nx-cmake/release-tools',
        options: {
          packageManager,
        }
      });
    }

    return nxJson;
  });

  // Generate configuration files
  const templatePath = path.join(__dirname, 'files');
  generateFiles(tree, templatePath, '.', {
    packageManager,
    skipGitConfig,
    tmpl: '',
  });

  // Update package.json with release scripts
  updateJson(tree, 'package.json', (packageJson) => {
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add release scripts
    packageJson.scripts['release:patch'] = 'nx-release patch';
    packageJson.scripts['release:minor'] = 'nx-release minor';
    packageJson.scripts['release:major'] = 'nx-release major';

    return packageJson;
  });

  // Update .gitignore
  if (!skipGitConfig && tree.exists('.gitignore')) {
    let gitignore = tree.read('.gitignore', 'utf-8') || '';
    const releaseIgnores = [
      '# Release tools',
      '.nx-release.local.json',
      'release.log',
    ];

    for (const ignore of releaseIgnores) {
      if (!gitignore.includes(ignore)) {
        gitignore += `\n${ignore}`;
      }
    }

    tree.write('.gitignore', gitignore);
  }

  await formatFiles(tree);

  logger.info(`
✅ Nx Release Tools initialized!

Next steps:
1. Review and customize .nx-release.json
2. Run "nx-release patch/minor/major" to create releases
3. Configure bundling in .nx-release.json if needed

Available commands:
- ${packageManager} run release:patch
- ${packageManager} run release:minor
- ${packageManager} run release:major
  `);
}

export default initGenerator;