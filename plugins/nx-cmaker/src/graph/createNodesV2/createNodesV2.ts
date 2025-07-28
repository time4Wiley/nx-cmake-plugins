import type { CreateNodesV2, CreateNodesResult } from '@nx/devkit';
import { createNodesFunction } from '../createNodesFunction/createNodesFunction';
import { PROJECT_FILE_PATTERN } from '../../config';

export const createNodesV2: CreateNodesV2 = [
    PROJECT_FILE_PATTERN,
    async (projectFiles, options, context) => {
        const results: Array<[string, CreateNodesResult]> = [];
        
        for (const file of projectFiles) {
            // Create a v1-compatible context
            const v1Context = {
                configFiles: Array.from(projectFiles),
                nxJsonConfiguration: context.nxJsonConfiguration,
                workspaceRoot: context.workspaceRoot,
            };
            
            const result = createNodesFunction(file, options, v1Context);
            // Ensure the result is not a promise
            const resolvedResult = await Promise.resolve(result);
            results.push([file, resolvedResult]);
        }
        
        return results;
    },
];