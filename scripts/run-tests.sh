#!/bin/bash

# Menu Visualizer Test Runner
# This script runs the complete test suite and reports results

echo "🧪 Running Menu Visualizer Tests..."
echo "=================================="

# Run tests with coverage
npx vitest run --reporter=verbose

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo "=================================="
else
    echo ""
    echo "❌ Some tests failed. Please check the output above."
    echo "=================================="
    exit 1
fi