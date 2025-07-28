import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration, addProjectConfiguration } from '@nx/devkit';
import { libGenerator } from '../library/libGenerator';
import { testGenerator } from './testGenerator';
import { initGenerator } from '../init/initGenerator';

describe('nx-cmaker test generator', () => {
    let tree: Tree;

    beforeEach(async () => {
        tree = createTreeWithEmptyWorkspace();
        // Initialize nx-cmaker first
        await initGenerator(tree, {
            language: 'C',
            cmakeConfigDir: '.cmake',
            appsDir: 'bin',
            libsDir: 'libs',
            addClangPreset: false,
            skipFormat: true,
            workspaceName: 'test-workspace'
        });
    });

    it('should add tests to a C library', async () => {
        // First create a library without tests
        await libGenerator(tree, {
            name: 'my-lib',
            language: 'C',
            generateTests: false,
        });

        // Then add tests
        await testGenerator(tree, {
            library: 'libmy-lib'  // Library project name is 'lib' + name
        });

        // Check test project was created
        const testConfig = readProjectConfiguration(tree, 'testlibmy-lib');
        expect(testConfig).toBeDefined();
        expect(testConfig.projectType).toBe('application');
        expect(testConfig.tags).toContain('test');
        expect(testConfig.tags).toContain('c');
    });

    it('should add tests to a C++ library', async () => {
        // First create a library without tests
        await libGenerator(tree, {
            name: 'my-cpp-lib',
            language: 'C++',
            generateTests: false,
        });

        // Then add tests
        await testGenerator(tree, {
            library: 'libmy-cpp-lib'  // Library project name is 'lib' + name
        });

        // Check test project was created
        const testConfig = readProjectConfiguration(tree, 'testlibmy-cpp-lib');
        expect(testConfig).toBeDefined();
        expect(testConfig.projectType).toBe('application');
        expect(testConfig.tags).toContain('test');
        expect(testConfig.tags).toContain('cpp');
    });

    it('should throw error if library does not exist', async () => {
        await expect(testGenerator(tree, {
            library: 'non-existent-lib'
        })).rejects.toThrow("Library 'non-existent-lib' not found in workspace");
    });

    it('should throw error if test already exists', async () => {
        // Create library with tests
        await libGenerator(tree, {
            name: 'with-tests',
            language: 'C',
            generateTests: true,
        });

        // The library generator created test project 'testwith-tests'
        // But our test generator would try to create 'testlibwith-tests' when given library name 'libwith-tests'
        // So let's manually create a test project with the name our generator would use
        addProjectConfiguration(tree, 'testlibwith-tests', {
            root: 'bin/testlibwith-tests',
            projectType: 'application',
            sourceRoot: 'bin/testlibwith-tests/src',
            tags: ['test', 'c'],
            targets: {}
        });

        // Try to add tests again
        await expect(testGenerator(tree, {
            library: 'libwith-tests'
        })).rejects.toThrow("Test project 'testlibwith-tests' already exists");
    });

    it('should throw error if project is not a library', async () => {
        // Create a mock project that's not a library
        tree.write('nx.json', JSON.stringify({
            version: 2,
            projects: {
                'my-app': 'apps/my-app'
            }
        }));
        tree.write('apps/my-app/project.json', JSON.stringify({
            name: 'my-app',
            projectType: 'application',
            tags: ['c']
        }));

        await expect(testGenerator(tree, {
            library: 'my-app'
        })).rejects.toThrow("Project 'my-app' is not a library (projectType: application)");
    });
});