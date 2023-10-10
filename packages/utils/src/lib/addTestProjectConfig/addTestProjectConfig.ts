import type { Tree } from '@nx/devkit';
import { addProjectConfiguration } from '@nx/devkit';
import { CProjectType, LibSchema } from '@/config';
import { getWorkspaceLayout } from '../getWorkspaceLayout/getWorkspaceLayout';
import { getProjectTargets } from '../getProjectTargets/getProjectTargets';

export const addTestProjectConfig = (
    tree: Tree,
    resolvedLibOptions: LibSchema,
): void => {
    if (!resolvedLibOptions.generateTests) {
        return;
    }
    const { appsDir } = getWorkspaceLayout();
    const { testName, languageExtension } = resolvedLibOptions;
    const testTargets = getProjectTargets(CProjectType.Test);
    addProjectConfiguration(tree, testName, {
        root: `${appsDir}/${testName}`,
        projectType: 'application',
        sourceRoot: `${appsDir}/${testName}/src`,
        tags: [languageExtension, 'test'],
        targets: testTargets,
    });
};
