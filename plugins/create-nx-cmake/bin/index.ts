#!/usr/bin/env node

import { createWorkspace } from 'create-nx-workspace';

async function main() {
    const name = process.argv[2]; // TODO: use libraries like yargs or enquirer to set your workspace name
    if (!name) {
        throw new Error('Please provide a name for the workspace');
    }

    console.log(`Creating the workspace: ${name}`);

    // TODO: update below to customize the workspace
    const { directory } = await createWorkspace(`nx-cmake`, {
        name,
        nxCloud: 'skip',
        interactive: false,
        packageManager: 'npm',
    });

    console.log(`Successfully created the workspace: ${directory}.`);
}

main();
