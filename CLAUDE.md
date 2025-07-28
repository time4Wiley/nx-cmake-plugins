# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Building
```bash
# Build affected projects
pnpm build

# Build all projects (skip cache)
pnpm build:all

# Build with CI configuration
pnpm build:ci
```

### Linting
```bash
# Lint affected projects
pnpm lint

# Lint all projects (skip cache)
pnpm lint:all

# Lint with CI configuration (fail on warnings)
pnpm lint:ci
```

### Testing
```bash
# Test affected projects
pnpm test

# Test all projects (skip cache)
pnpm test:all

# Test with CI configuration (with coverage)
pnpm test:ci

# Run a single test file
pnpm nx test nx-cmaker --testFile=src/executors/cmake/cmakeExecutor.spec.ts
```

### E2E Testing
```bash
# Run affected E2E tests
pnpm e2e

# Run all E2E tests
pnpm e2e:all
```

### Code Formatting
```bash
# Check formatting
pnpm fmt:check

# Apply formatting
pnpm fmt
```

### Release and Publishing
```bash
# Create a release (without publishing)
pnpm nx-release

# Publish to npm (requires OTP)
OTP=<your-otp> pnpm nx-publish
```

## High-Level Architecture

### Project Structure
This is an Nx monorepo containing plugins for enhancing CMake/C/C++ development within Nx workspaces. The main plugin is `nx-cmaker`.

### Core Components

#### 1. **Plugin Core** (`plugins/nx-cmaker/src/`)
- **Executors**: Implementation of build tasks (cmake, compile, lint, fmt, test, execute, debug)
- **Generators**: Code scaffolding for C/C++ projects (init, binary, library, link)
- **Graph Processing**: Project dependency analysis using the Nx project graph
- **Configuration**: Plugin settings and program discovery for cross-platform support

#### 2. **Project Inference**
The plugin automatically infers projects from `CMakeLists.txt` files:
- Uses `createNodesFunction` in `src/graph/createNodesFunction/createNodesFunction.ts`
- Each CMakeLists.txt registers a project in the Nx graph
- Supports automatic dependency detection between C/C++ projects

#### 3. **Dependency Analysis**
- Uses `gcc -MM` for tracking source file dependencies
- Performs transitive reduction to optimize the dependency graph
- Integrates with Nx's caching mechanisms for efficient builds

#### 4. **Cross-Platform Support**
The plugin includes platform-specific program mappings:
- Windows: Uses MSYS2/MinGW paths
- macOS: Maps to system or Homebrew installations
- Linux: Standard system paths

#### 5. **Test Frameworks**
- C projects: CMocka support with automatic installation
- C++ projects: GoogleTest support with automatic installation

### Key Files to Understand

1. **Plugin Entry**: `plugins/nx-cmaker/src/index.ts` - Exports all public APIs
2. **Project Graph**: `plugins/nx-cmaker/src/graph/createNodesFunction/createNodesFunction.ts` - Project inference logic
3. **Executors**: `plugins/nx-cmaker/src/executors/executor.ts` - Base executor class
4. **Generators**: `plugins/nx-cmaker/src/generators/generator.ts` - Base generator class
5. **Configuration**: `plugins/nx-cmaker/src/config/` - Plugin configuration and program discovery

### Testing Strategy
- Unit tests for all utilities and core functions
- E2E tests for plugin installation and project generation
- Mock implementations for external dependencies (file system, child processes)

### Plugin Configuration
The plugin is configured via `nx.json`:
- `pluginsConfig.nx-cmaker`: Global plugin settings
- Target defaults for caching and dependencies
- Named inputs for CMake, clang-format, and clang-tidy files