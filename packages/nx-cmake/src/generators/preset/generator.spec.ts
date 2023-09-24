import type { Tree } from '@nx/devkit';
import type { WorkspaceLayout } from '../../models/types';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readNxJson } from '@nx/devkit';
import presetGenerator from './generator';

describe('preset generator', () => {
    let tree: Tree;
    let expectedWorkspaceLayout: WorkspaceLayout;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
        expectedWorkspaceLayout = {
            appsDir: 'bin',
            libsDir: 'libs',
        };
    });

    it('should run successfully', async () => {
        await presetGenerator(tree);
        const { workspaceLayout } = readNxJson(tree);
        expect(workspaceLayout).toEqual(expectedWorkspaceLayout);
    });
});
