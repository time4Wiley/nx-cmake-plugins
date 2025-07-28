#!/bin/bash

# Script to handle npm releases with OTP

# Check if version type is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/release.sh [patch|minor|major] [otp]"
    echo "Example: ./scripts/release.sh major 123456"
    exit 1
fi

VERSION_TYPE=$1
OTP_CODE=$2

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

# Step 3: Publish with OTP
if [ -z "$OTP_CODE" ]; then
    echo "🔐 Enter your npm OTP code:"
    read -r OTP_CODE
fi

echo "📦 Publishing to npm..."
OTP=$OTP_CODE pnpm nx-publish

if [ $? -eq 0 ]; then
    echo "✅ Release completed successfully!"
else
    echo "❌ Publishing failed"
    exit 1
fi