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
    echo "📌 Don't forget to:"
    echo "   1. Push commits: git push"
    echo "   2. Push tags: git push --tags"
else
    echo "❌ Publishing failed"
    exit 1
fi