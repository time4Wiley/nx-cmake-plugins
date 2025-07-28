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

# Step 3: Everything is ready, now ask for OTP
echo ""
echo "✅ Version bumped and packages built successfully!"
echo "📦 Ready to publish to npm..."
echo ""
echo "🔐 Enter your npm OTP code:"
read -r OTP_CODE

# Step 4: Publish with OTP
echo "📤 Publishing to npm..."
OTP=$OTP_CODE pnpm nx-publish

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Release completed successfully!"
    echo "✅ Don't forget to push tags: git push --follow-tags"
else
    echo "❌ Publishing failed"
    exit 1
fi