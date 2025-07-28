import type { NxPluginV2 } from '@nx/devkit';
import { PLUGIN_NAME as name } from './config/name';
import { createDependencies } from './graph/createDependencies/createDependencies';
import { createNodesV2 } from './graph/createNodesV2/createNodesV2';

const nxPlugin: NxPluginV2 = {
    name,
    createDependencies,
    createNodesV2,
};

export = nxPlugin;
