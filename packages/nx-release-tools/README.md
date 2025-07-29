# @time4peter/nx-release-tools

Automated release tools for Nx monorepos with OTP-aware publishing, git tagging, and TypeScript path alias bundling.

## Features

- 🚀 **Automated Releases** - Version bump, build, and publish in one command
- 🔐 **Smart OTP Handling** - Prompts for OTP only when ready to publish
- 🏷️ **Auto Git Tagging** - Creates git tags for each package version
- 📦 **TypeScript Bundling** - Bundles internal dependencies and fixes path aliases
- 🔧 **Multi Package Manager** - Supports npm, pnpm, and yarn
- 🎯 **Nx Integration** - First-class Nx plugin with generators and executors
- 💻 **CLI Tool** - Standalone `nx-release` command

## Installation

```bash
npm install -D @time4peter/nx-release-tools
# or
pnpm add -D @time4peter/nx-release-tools
# or
yarn add -D @time4peter/nx-release-tools
```

## Quick Start

### 1. Initialize Release Configuration

```bash
nx g @time4peter/nx-release-tools:init
```

This will:
- Create `.nx-release.json` configuration file
- Add release scripts to `package.json`
- Set up bundling scripts if needed
- Update `.gitignore`

### 2. Configure (Optional)

Edit `.nx-release.json` to customize:

```json
{
  "packageManager": "pnpm",
  "packages": [
    {
      "name": "*",
      "path": "packages/*",
      "distPath": "dist/packages/*"
    }
  ],
  "bundling": {
    "enabled": true,
    "aliases": {
      "@my-org/utils": "./packages/utils",
      "@/core": "./packages/core"
    }
  }
}
```

### 3. Create a Release

```bash
# Patch release (0.0.x)
npm run release:patch

# Minor release (0.x.0)
npm run release:minor

# Major release (x.0.0)
npm run release:major
```

## How It Works

1. **Version Bump** - Uses `nx release version` or fallback to npm
2. **Git Tags** - Creates tags like `@org/package@1.0.0`
3. **Build** - Runs your build command
4. **Bundle** - Fixes TypeScript path aliases (if enabled)
5. **OTP Prompt** - Asks for OTP right before publishing
6. **Publish** - Publishes to npm with OTP
7. **Git Push** - Pushes commits and tags

## Configuration Options

### packages
Define which packages to release:
```json
"packages": [
  {
    "name": "@my-org/*",
    "path": "packages/*",
    "distPath": "dist/packages/*"
  }
]
```

### bundling
Bundle internal dependencies:
```json
"bundling": {
  "enabled": true,
  "aliases": {
    "@internal/util": "./packages/util"
  }
}
```

### git
Configure git behavior:
```json
"git": {
  "tags": true,
  "push": true,
  "commitMessage": "chore(release): {version}"
}
```

## CLI Usage

The `nx-release` CLI is available after installation:

```bash
# Show help
nx-release --help

# Create releases
nx-release patch
nx-release minor
nx-release major

# Initialize configuration
nx-release init
```

## Nx Executor

Use in `project.json`:

```json
{
  "targets": {
    "release": {
      "executor": "@time4peter/nx-release-tools:release",
      "options": {
        "versionType": "patch"
      }
    }
  }
}
```

## License

MIT