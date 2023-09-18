import type { Tree } from '@nx/devkit';
import type { InitGeneratorSchema } from '../../schema';
import { generateFiles } from '@nx/devkit';
import { join } from 'path';

export const generateCmakeConfigFiles = (
    tree: Tree,
    options: InitGeneratorSchema
) => {
    generateFiles(
        tree,
        join(__dirname, '../../', 'template', 'cmake'),
        options.cmakeConfigDir,
        options
    );
};
