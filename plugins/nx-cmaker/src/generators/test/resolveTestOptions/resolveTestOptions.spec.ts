import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, addProjectConfiguration } from '@nx/devkit';
import { resolveTestOptions } from './resolveTestOptions';

describe('resolveTestOptions', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
        
        // Mock nx.json with plugin config
        tree.write('nx.json', JSON.stringify({
            pluginsConfig: {
                'nx-cmaker': {
                    language: 'C',
                    cmakeConfigDir: '.cmake',
                    appsDir: 'bin',
                    libsDir: 'libs'
                }
            }
        }));
    });

    it('should resolve options for a C library', () => {
        // Add a C library project
        addProjectConfiguration(tree, 'my-c-lib', {
            root: 'libs/my-c-lib',
            projectType: 'library',
            sourceRoot: 'libs/my-c-lib/src',
            tags: ['c', 'library'],
            targets: {}
        });

        const options = resolveTestOptions(tree, { library: 'my-c-lib' });

        expect(options.name).toBe('my-c-lib');
        expect(options.libName).toBe('my_c_lib');
        expect(options.testName).toBe('my-c-lib-test');
        expect(options.language).toBe('C');
        expect(options.languageExtension).toBe('c');
        expect(options.cmakeC).toBe('C');
        expect(options.testLib).toBe('cmocka');
        expect(options.snakeCaseLibName).toBe('my_c_lib');
        expect(options.snakeCaseProjectName).toBe('my_c_lib');
        expect(options.camelCaseProjectName).toBe('myCLib');
    });

    it('should resolve options for a C++ library', () => {
        // Add a C++ library project
        addProjectConfiguration(tree, 'my-cpp-lib', {
            root: 'libs/my-cpp-lib',
            projectType: 'library',
            sourceRoot: 'libs/my-cpp-lib/src',
            tags: ['cpp', 'library'],
            targets: {}
        });

        const options = resolveTestOptions(tree, { library: 'my-cpp-lib' });

        expect(options.name).toBe('my-cpp-lib');
        expect(options.libName).toBe('my_cpp_lib');
        expect(options.testName).toBe('my-cpp-lib-test');
        expect(options.language).toBe('C++');
        expect(options.languageExtension).toBe('cpp');
        expect(options.cmakeC).toBe('CXX');
        expect(options.testLib).toBe('gtest');
        expect(options.snakeCaseLibName).toBe('my_cpp_lib');
        expect(options.snakeCaseProjectName).toBe('my_cpp_lib');
        expect(options.camelCaseProjectName).toBe('myCppLib');
    });

    it('should throw error if library has no language tag', () => {
        // Add a library without language tag
        addProjectConfiguration(tree, 'no-lang-lib', {
            root: 'libs/no-lang-lib',
            projectType: 'library',
            sourceRoot: 'libs/no-lang-lib/src',
            tags: ['library'],
            targets: {}
        });

        expect(() => resolveTestOptions(tree, { library: 'no-lang-lib' }))
            .toThrow("Could not determine language for library no-lang-lib. Library must have 'c' or 'cpp' tag.");
    });
});