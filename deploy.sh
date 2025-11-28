#!/bin/bash

# Deployment script for Mobile Store

set -e

echo "🚀 Starting deployment process..."

# Check if we're on the main branch
if [[ $(git branch --show-current) != "main" ]]; then
    echo "⚠️  Warning: Not on main branch. Deploying from $(git branch --show-current)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type checking
echo "🔍 Running type checks..."
npm run type-check

# Linting
echo "✨ Running linter..."
npm run lint

# Format check
echo "🎨 Checking formatting..."
npm run format:check

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Build and deploy worker
echo "☁️  Deploying Cloudflare Worker..."
cd worker
npm ci
npm run deploy

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: Deploy your frontend to Cloudflare Pages"
echo "🔧 Worker: Deployed to Cloudflare Workers"