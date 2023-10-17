import type { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { initGenerator } from '../initGenerator/initGenerator';
import { getDefaultInitGeneratorOptions } from '@/config';
import { addProjectRootToSubDirectories } from './addProjectRootToSubDirectories';
import * as devkit from '@nx/devkit';

describe('addProjectRootToSubDirectories', () => {
    let tree: Tree;
    let projectRoot: string;
    let expectedProjectsFile: string;

    beforeEach(async () => {
        jest.spyOn(devkit, 'formatFiles').mockImplementation(jest.fn());
        projectRoot = `bin/project`;
        tree = createTreeWithEmptyWorkspace();
        await initGenerator(tree, getDefaultInitGeneratorOptions());
        expectedProjectsFile =
            'set(SUB_DIRECTORIES)\n\n' +
            `list(APPEND SUB_DIRECTORIES ${projectRoot})`;
    });

    it('should add binary to projects', () => {
        let updatedProjectsFile = addProjectRootToSubDirectories(
            tree,
            projectRoot,
        );
        expect(updatedProjectsFile).toStrictEqual(expectedProjectsFile);
        projectRoot += 2;
        updatedProjectsFile = addProjectRootToSubDirectories(tree, projectRoot);
        expect(updatedProjectsFile).toStrictEqual(
            expectedProjectsFile +
                `\nlist(APPEND SUB_DIRECTORIES ${projectRoot})`,
        );
    });
});
