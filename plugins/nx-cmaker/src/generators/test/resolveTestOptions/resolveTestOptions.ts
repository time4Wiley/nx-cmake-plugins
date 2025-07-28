import type { Tree } from '@nx/devkit';
import { readProjectConfiguration, offsetFromRoot } from '@nx/devkit';
import { CProjectType, C } from '@/types';
import {
    getTestName,
    getTestLib,
    snakeCaseToCamelCase,
    getProjectRoot,
    getLanguageExtension,
} from '@/util';
import { resolveOptions } from '../../../utils/resolveOptions/resolveOptions';
import { getPluginConfig } from '../../../utils/getPluginConfig/getPluginConfig';

export interface TestGeneratorSchema {
    library: string;
}

export interface TestSchema extends TestGeneratorSchema {
    name: string;
    libName: string;
    testName: string;
    language: C;
    languageExtension: string;
    cmakeC: string;
    testLib: 'gtest' | 'cmocka';
    snakeCaseLibName: string;
    snakeCaseProjectName: string;
    camelCaseProjectName: string;
    relativeRootPath: string;
    projectRoot: string;
    cmakeConfigDir: string;
    workspaceName: string;
    constantName: string;
    snakeCaseName: string;
    camelCaseName: string;
    className: string;
    libsDir: string;
    appsDir: string;
    generateTests: boolean;
}

export const resolveTestOptions = (tree: Tree, options: TestGeneratorSchema): TestSchema => {
    // Read the library project configuration to get language info
    const libConfig = readProjectConfiguration(tree, options.library);
    
    // Detect language from library tags
    const languageTag = libConfig.tags?.find(tag => tag === 'c' || tag === 'cpp');
    if (!languageTag) {
        throw new Error(`Could not determine language for library ${options.library}. Library must have 'c' or 'cpp' tag.`);
    }
    
    const language: C = languageTag === 'c' ? 'C' : 'C++';
    const languageExtension = getLanguageExtension(language);
    const cmakeC = language === 'C' ? 'C' : 'CXX';
    
    // Create base options with detected language
    const baseOptions = {
        ...options,
        name: options.library,
        language
    };
    
    const resolvedOptions = resolveOptions<typeof baseOptions, TestSchema>(baseOptions);
    
    const { name } = resolvedOptions;
    const projectRoot = getProjectRoot(name, CProjectType.Test);
    const relativeRootPath = offsetFromRoot(projectRoot);
    const libName = options.library;  // Use the library name as-is (it's already the project name)
    const testName = getTestName(options.library);
    const testLib = getTestLib(language);
    const snakeCaseProjectName = name.replace(/-/g, '_').toLowerCase();
    const snakeCaseLibName = libName.replace(/-/g, '_').toLowerCase();
    const camelCaseProjectName = snakeCaseToCamelCase(snakeCaseProjectName);
    const { cmakeConfigDir, workspaceName } = getPluginConfig();

    // Add all missing properties to satisfy LibSchema requirements
    resolvedOptions.libName = libName;
    resolvedOptions.testName = testName;
    resolvedOptions.languageExtension = languageExtension;
    resolvedOptions.cmakeC = cmakeC;
    resolvedOptions.testLib = testLib;
    resolvedOptions.snakeCaseLibName = snakeCaseLibName;
    resolvedOptions.snakeCaseProjectName = snakeCaseProjectName;
    resolvedOptions.camelCaseProjectName = camelCaseProjectName;
    resolvedOptions.relativeRootPath = relativeRootPath;
    resolvedOptions.projectRoot = projectRoot;
    resolvedOptions.cmakeConfigDir = cmakeConfigDir;
    resolvedOptions.workspaceName = workspaceName;
    resolvedOptions.generateTests = true;  // Always true for test generator

    return resolvedOptions;
};