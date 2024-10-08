import { fileExists } from '../fileExists/fileExists';
import { getAbsolutePath } from '../getAbsolutePath/getAbsolutePath';

export const getConfigFile = (
    workspaceRoot: string,
    projectRoot: string,
    configFile: string,
): string => {
    const joinedProjectRoot = getAbsolutePath(workspaceRoot, projectRoot);
    const projectConfigFile = getAbsolutePath(joinedProjectRoot, configFile);
    const workspaceConfigFile = getAbsolutePath(workspaceRoot, configFile);
    const projectConfigFileExists = fileExists(projectConfigFile);
    const workspaceConfigFileExists = fileExists(workspaceConfigFile);

    if (projectConfigFileExists) {
        return projectConfigFile;
    }

    if (workspaceConfigFileExists) {
        return workspaceConfigFile;
    }

    throw new Error(
        `Could not find ${configFile}. Please generate a preset using nx-cmaker:init or provide your own.`,
    );
};
