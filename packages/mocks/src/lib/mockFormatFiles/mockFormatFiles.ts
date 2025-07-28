import * as devkit from '@nx/devkit';

export const mockFormatFiles = () => {
    const formatFilesMock = jest
        .spyOn(devkit, 'formatFiles')
        .mockImplementation(jest.fn());
    return formatFilesMock;
};
