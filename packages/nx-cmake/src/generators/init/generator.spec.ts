import type { Tree } from '@nx/devkit';
import type { InitGeneratorSchema } from './schema';
import { output } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initGenerator from './generator';
import * as checkNxVersionModule from '../../utils/generatorUtils/checkNxVersion/checkNxVersion';
import * as devkit from '@nx/devkit';

describe('init generator', () => {
    let tree: Tree;
    let options: InitGeneratorSchema;
    let checkNxVersionMock: jest.SpyInstance;
    let nxOutputWarnMock: jest.SpyInstance;
    let nxOutputErrorMock: jest.SpyInstance;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
        options = {
            language: 'C',
            cmakeConfigDir: '.cmake',
            globalIncludeDir: 'include',
            appsDir: 'bin',
            libsDir: 'packages',
            addClangPreset: true,
            skipFormat: false,
        };
        checkNxVersionMock = jest.spyOn(checkNxVersionModule, 'checkNxVersion');
        nxOutputWarnMock = jest.spyOn(output, 'warn');
        nxOutputErrorMock = jest.spyOn(output, 'error');
        jest.spyOn(devkit, 'formatFiles').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should run successfully with formatting', async () => {
        await initGenerator(tree, options);
        expect(checkNxVersionMock).toHaveBeenCalledTimes(1);
        expect(nxOutputWarnMock).toHaveBeenCalledTimes(0);
        expect(nxOutputErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should run successfully without formatting', async () => {
        await initGenerator(tree, options);
        expect(checkNxVersionMock).toHaveBeenCalledTimes(1);
        expect(nxOutputWarnMock).toHaveBeenCalledTimes(0);
        expect(nxOutputErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should warn when nx version unsupported', async () => {
        checkNxVersionMock.mockReturnValueOnce(false);
        nxOutputWarnMock.mockImplementationOnce(jest.fn());
        await initGenerator(tree, options);
        expect(checkNxVersionMock).toHaveBeenCalledTimes(1);
        expect(nxOutputWarnMock).toHaveBeenCalledTimes(1);
        expect(nxOutputErrorMock).toHaveBeenCalledTimes(0);
    });
});
