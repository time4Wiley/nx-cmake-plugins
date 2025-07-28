#!/bin/bash

# Script to handle npm releases with OTP

# Check if version type is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/release.sh [patch|minor|major]"
    echo "Example: ./scripts/release.sh major"
    exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "Error: Version type must be 'patch', 'minor', or 'major'"
    exit 1
fi

echo "🚀 Starting $VERSION_TYPE release..."

# Step 1: Bump version
echo "📝 Bumping version..."
pnpm nx release version $VERSION_TYPE

if [ $? -ne 0 ]; then
    echo "❌ Version bump failed"
    exit 1
fi

# Step 1b: Get new versions and create git tags
echo "🏷️  Creating git tags..."
NX_CMAKER_VERSION=$(node -p "require('./plugins/nx-cmaker/package.json').version")
CREATE_NX_CMAKER_VERSION=$(node -p "require('./plugins/create-nx-cmaker/package.json').version")

# Create tags
git tag -a "nx-cmaker-${NX_CMAKER_VERSION}" -m "Release nx-cmaker v${NX_CMAKER_VERSION}"
git tag -a "create-nx-cmaker-${CREATE_NX_CMAKER_VERSION}" -m "Release create-nx-cmaker v${CREATE_NX_CMAKER_VERSION}"

echo "✅ Created tags: nx-cmaker-${NX_CMAKER_VERSION}, create-nx-cmaker-${CREATE_NX_CMAKER_VERSION}"

# Commit version changes
echo "💾 Committing version changes..."
git add plugins/*/package.json
git commit -m "chore(release): release version ${NX_CMAKER_VERSION} [skip ci]"

if [ $? -ne 0 ]; then
    echo "⚠️  No changes to commit (versions might already be committed)"
fi

# Step 2: Build
echo "🔨 Building all packages..."
pnpm build:all

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Step 2b: Fix imports for nx-cmaker
echo "📦 Bundling internal dependencies for nx-cmaker..."
node scripts/fix-imports.js

if [ $? -ne 0 ]; then
    echo "❌ Import fix failed"
    exit 1
fi

# Step 3: Prepare for publishing
echo ""
echo "✅ Version bumped and packages built successfully!"
echo "📦 Preparing to publish to npm..."

# Check which packages need to be published
echo ""
echo "📋 Packages to publish:"
ls -la dist/plugins/

# Step 4: Now we're really ready - ask for OTP at the last moment
echo ""
echo "🔐 Enter your npm OTP code (will publish immediately after):"
read -r OTP_CODE

# Step 5: Publish immediately after getting OTP
echo "📤 Publishing to npm..."
cd dist/plugins/nx-cmaker && npm publish --otp=$OTP_CODE && cd ../../..
cd dist/plugins/create-nx-cmaker && npm publish --otp=$OTP_CODE && cd ../../..

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Release completed successfully!"
    echo "✅ Packages published:"
    echo "   - nx-cmaker"
    echo "   - create-nx-cmaker"
    echo ""
    
    # Step 6: Push commits and tags
    echo "📤 Pushing commits to remote..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Commits pushed successfully"
    else
        echo "⚠️  Failed to push commits, please run 'git push' manually"
    fi
    
    echo "📤 Pushing tags to remote..."
    git push --tags
    
    if [ $? -eq 0 ]; then
        echo "✅ Tags pushed successfully"
    else
        echo "⚠️  Failed to push tags, please run 'git push --tags' manually"
    fi
    
    echo ""
    echo "🚀 Release fully completed!"
else
    echo "❌ Publishing failed"
    exit 1
fi