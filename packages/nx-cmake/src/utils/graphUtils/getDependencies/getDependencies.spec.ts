import type {
    ProjectFileMap,
    ProjectGraphDependencyWithFile,
} from '@nx/devkit';
import type { FilteredProject, WorkspaceLayout } from '../../../models/types';
import { DependencyType } from '@nx/devkit';
import { CProjectType } from '../../../models/types';
import { getDependencies } from './getDependencies';
import * as filterDependenciesOfProjectModule from '../filterDependenciesOfProject/filterDependenciesOfProject';

describe('getDependencies', () => {
    let filesToProcess: ProjectFileMap;
    let projects: FilteredProject[];
    let workspaceLayout: WorkspaceLayout;
    let expectedDependencies: ProjectGraphDependencyWithFile[];
    let filterDependenciesOfProjectMock: jest.SpyInstance;

    beforeEach(() => {
        workspaceLayout = {
            appsDir: 'bin',
            libsDir: 'packages',
            projectNameAndRootFormat: 'as-provided',
        };
        projects = [
            {
                name: 'testparser',
                root: 'packages/parser/test',
                type: CProjectType.Test,
                tag: 'c',
                sourceRoot: 'packages/parser/test/src',
            },
            {
                name: 'libparser',
                root: 'packages/parser',
                type: CProjectType.Lib,
                tag: 'c',
                sourceRoot: 'packages/parser/src',
            },
            {
                name: 'parser',
                root: 'bin/parser',
                type: CProjectType.App,
                tag: 'c',
                sourceRoot: 'bin/parser/src',
            },
        ];
        expectedDependencies = [
            {
                source: 'parser',
                target: 'libparser',
                sourceFile: 'bin/parser/include/parser.h',
                dependencyType: DependencyType.static,
            },
            {
                source: 'parser',
                target: 'libparser',
                sourceFile: 'bin/parser/src/parser.c',
                dependencyType: DependencyType.static,
            },
        ];
        filesToProcess = {
            parser: [
                {
                    file: 'bin/parser/include/parser.h',
                    hash: '11279262444086169535',
                },
                {
                    file: 'bin/parser/src/parser.c',
                    hash: '12936305865606923809',
                },
            ],
        };
        filterDependenciesOfProjectMock = jest.spyOn(
            filterDependenciesOfProjectModule,
            'filterDependenciesOfProject',
        );
        filterDependenciesOfProjectMock.mockReturnValueOnce([
            {
                source: 'parser',
                target: 'libparser',
                sourceFile: 'bin/parser/include/parser.h',
                dependencyType: 'static',
            },
            {
                source: 'parser',
                target: 'libparser',
                sourceFile: 'bin/parser/src/parser.c',
                dependencyType: 'static',
            },
        ]);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should not get dependencies if no files to process', () => {
        filesToProcess = {};
        const result = getDependencies(
            workspaceLayout,
            projects,
            filesToProcess,
        );
        expect(filterDependenciesOfProjectMock).toBeCalledTimes(0);
        expect(result).toStrictEqual([]);
    });

    it('should get dependencies', () => {
        const result = getDependencies(
            workspaceLayout,
            projects,
            filesToProcess,
        );
        expect(filterDependenciesOfProjectMock).toBeCalledTimes(
            Object.keys(filesToProcess).length,
        );
        expect(result).toStrictEqual(expectedDependencies);
    });
});
