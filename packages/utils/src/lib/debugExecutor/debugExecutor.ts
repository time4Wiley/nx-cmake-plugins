import type { DebugExecutorSchema, Executor } from '@/config';
import { debugBinaryWithGdb } from '../debugBinaryWithGdb/debugBinaryWithGdb';
import { logger } from '@/log';
import { extractRootsFromExecutorContext } from '@/util';

export const debugExecutor: Executor<DebugExecutorSchema> = async function* (
    options,
    ctx,
) {
    logger(`Running debug executor`);
    const { workspaceRoot, projectRoot } = extractRootsFromExecutorContext(ctx);
    const { projectName } = ctx;
    if (!projectName) {
        throw new Error('Failed to get project name');
    }
    const success = debugBinaryWithGdb(
        workspaceRoot,
        projectRoot,
        projectName,
        options,
    );
    yield {
        success,
    };
};
