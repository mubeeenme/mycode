#!/bin/bash

echo "🚀 Setting up E-commerce Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

# Check for required CLI tools
echo "🔍 Checking for required CLI tools..."

if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler not found. Installing globally..."
    npm install -g wrangler
fi

if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Please install it from https://supabase.com/docs/reference/cli"
    echo "💡 Run: npm install -g supabase"
    echo "   Or follow installation guide at https://supabase.com/docs/reference/cli/installation"
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your Supabase project and update wrangler.toml with your credentials"
echo "2. Run 'supabase start' to start local Supabase"
echo "3. Run 'supabase db push' to apply migrations"
echo "4. Run 'npm run dev' to start the development server"
echo "5. Run 'npm test' to run tests"
echo ""
echo "📚 Check README.md for detailed documentation"