import type { Tree } from '@nx/devkit';
import type { LinkSchema } from '@/config';
import { PROJECT_FILE } from '@/config';
import { trimLib } from '../trimLib/trimLib';
import { writeFileWithTree } from '../writeFileWithTree/writeFileWithTree';
import { join } from 'path';
import { updateFile } from '../updateFile/updateFileFile';

export const getCmakeLink = (target: string): string => {
    const trimmedTarget = trimLib(target);
    const cmakeLink = `link_library(\${CMAKE_PROJECT_NAME} ${trimmedTarget})\n`;
    return cmakeLink;
};

export const getSourceCmakeFile = (sourceProjectRoot: string): string => {
    const cmakeFile = join(`${sourceProjectRoot}/${PROJECT_FILE}`);
    return cmakeFile;
};

export const updateCmakeFile = (tree: Tree, options: LinkSchema) => {
    const { target, sourceProjectRoot } = options;
    const cmakeLink = getCmakeLink(target);
    const cmakeFile = getSourceCmakeFile(sourceProjectRoot);
    const updatedCmakeFileContent = updateFile(tree, cmakeFile, cmakeLink);
    return writeFileWithTree(tree, cmakeFile, updatedCmakeFileContent);
};
