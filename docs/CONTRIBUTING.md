# Contributing to Sunday School Transformation

Thank you for your interest in contributing to the Sunday School Transformation project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/sunday-school-transformation.git
   cd sunday-school-transformation
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes
2. Run tests to ensure your changes don't break existing functionality:
   ```bash
   npm test
   ```
3. Format your code:
   ```bash
   npm run format
   ```
4. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```
5. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a pull request from your fork to the main repository

## Pull Request Guidelines

- Provide a clear, descriptive title
- Reference any related issues
- Include a summary of the changes and the problem they solve
- Include screenshots or GIFs for UI changes
- Make sure all tests pass
- Follow the existing code style

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Write meaningful comments
- Include JSDoc comments for functions and classes
- Write tests for new features

## Working with MCP Servers

When working with MCP servers:

1. Always check port availability before starting servers
2. Use the provided utility functions for interacting with servers
3. Handle errors gracefully
4. Log important events
5. Ensure proper cleanup when servers are stopped

## Documentation

- Update documentation for any changes to APIs or functionality
- Document new features thoroughly
- Keep the README.md up to date

## Testing

- Write unit tests for new functionality
- Ensure existing tests pass
- Consider edge cases in your tests

## Reporting Issues

When reporting issues, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or error messages if applicable
- Environment information (OS, browser, Node.js version, etc.)

## Feature Requests

Feature requests are welcome! Please include:

- A clear, descriptive title
- A detailed description of the proposed feature
- Any relevant mockups or examples
- The problem the feature would solve

## Questions?

If you have any questions about contributing, please open an issue with the "question" label.

Thank you for contributing to Sunday School Transformation!
