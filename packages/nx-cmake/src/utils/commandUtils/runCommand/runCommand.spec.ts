import { runCommand } from './runCommand';
import { output } from '@nx/devkit';
import * as child_process from 'child_process';

describe('runCommand', () => {
    let execSyncMock: jest.SpyInstance;
    let outputErrorMock: jest.SpyInstance;

    beforeEach(() => {
        execSyncMock = jest.spyOn(child_process, 'execSync');
        outputErrorMock = jest.spyOn(output, 'error');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return success:true when the command succeeds', () => {
        execSyncMock.mockReturnValue('');
        const result = runCommand('echo', 'Hello,', 'World!');
        expect(result).toEqual({ success: true });
        expect(execSyncMock).toHaveBeenCalledWith('echo Hello, World!', {
            encoding: 'utf-8',
            stdio: ['inherit', 'inherit', 'pipe'],
        });
        expect(outputErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should return success:false when the command fails', () => {
        execSyncMock.mockImplementation(() => {
            throw new Error('Command failed');
        });
        outputErrorMock.mockImplementationOnce(jest.fn());
        const result = runCommand('invalid-command');
        expect(result).toEqual({ success: false });
        expect(execSyncMock).toHaveBeenCalledWith('invalid-command', {
            encoding: 'utf-8',
            stdio: ['inherit', 'inherit', 'pipe'],
        });
        expect(outputErrorMock).toHaveBeenCalledWith({
            title: 'nx-cmake command failed: invalid-command',
            bodyLines: ['Command failed'],
        });
    });

    it('should print stderr', () => {
        outputErrorMock.mockImplementationOnce(jest.fn());
        const result = runCommand(`ls doenstexist`);
        expect(result).toEqual({ success: false });
        expect(outputErrorMock).toHaveBeenCalledTimes(1);
    });
});
