import type { Tree } from '@nx/devkit';
import { formatFiles, readProjectConfiguration } from '@nx/devkit';
import { linkGenerator } from '../link/linkGenerator';
import { TestGeneratorSchema } from './resolveTestOptions/resolveTestOptions';
import { resolveTestOptions } from './resolveTestOptions/resolveTestOptions';
import { addTestProjectConfig } from '../library/addTestProjectConfig/addTestProjectConfig';
import { generateLibTestFiles } from '../library/generateLibTestFiles/generateLibTestFiles';
import { LibSchema } from '../generator';
import { getTestName } from '@/util';

export async function testGenerator(tree: Tree, options: TestGeneratorSchema) {
    // Check if library exists
    try {
        readProjectConfiguration(tree, options.library);
    } catch (e) {
        throw new Error(`Library '${options.library}' not found in workspace`);
    }
    
    // Check if test project already exists
    const testName = getTestName(options.library);
    try {
        readProjectConfiguration(tree, testName);
        throw new Error(`Test project '${testName}' already exists`);
    } catch (e: any) {
        // Test doesn't exist, which is what we want
        if (e.message && e.message.includes('already exists')) {
            throw e;
        }
    }
    
    // Resolve options with detected language and settings
    const resolvedOptions = resolveTestOptions(tree, options);
    
    // Check if library is actually a library project
    const libConfig = readProjectConfiguration(tree, options.library);
    if (libConfig.projectType !== 'library') {
        throw new Error(`Project '${options.library}' is not a library (projectType: ${libConfig.projectType})`);
    }
    
    // Generate test files using existing templates
    generateLibTestFiles(tree, resolvedOptions as LibSchema);
    
    // Add test project configuration
    addTestProjectConfig(tree, resolvedOptions as LibSchema);
    
    // Link test project to library
    const linkOptions = { 
        target: resolvedOptions.libName, 
        source: resolvedOptions.testName 
    };
    linkGenerator(tree, linkOptions);
    
    await formatFiles(tree);
    
    console.log(`\n✅ Successfully added tests for library '${options.library}'`);
    console.log(`\n📂 Test project created: ${resolvedOptions.testName}`);
    console.log(`🔗 Linked to library: ${resolvedOptions.libName}`);
    console.log(`\n🚀 Run tests with: nx test ${resolvedOptions.testName}`);
}

export default testGenerator;