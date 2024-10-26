# Qit 🚀

A simple CLI tool to automate your git workflow. Qit combines the three most common git commands (`git add .`, `git commit -m`, and `git push`) into a single command.

## Installation

### Global Installation(preferred)

To install the qit-cli globally so it can be used anywhere on your system:

```bash
npm install -g qit-cli
```

### Local Installation

If you prefer to install it locally in a specific project folder:

```bash
npm install qit-cli
```

To run it locally, use npx in your project folder:

```bash
npx qit "Your commit message"

```

If installed glabally, just use qit in your project folder:

```bash
qit "Your commit message"

```

## Usage

### Basic Usage

To quickly stage, commit and push your changes, use:

```bash
qit "your commit message"
```

The command above will:

1.  Stage all changes (git add .)
2.  Create a commit with your message (git commit -m "your message")
3.  Push to your configured branch (git push origin )

### Examples

```bash
# Fix a bug
qit "fixed navigation menu bug"

# Add new feature

qit "added dark mode support"

# Update documentation

qit "updated installation docs"
```
``` bash
qit "Your commit message" --files file1.txt file2.js src/main.dart
```
The command above will:

1.  Stage changes changes only in that file(git add <file_path>)
2.  Create a commit with your message (git commit -m "your message")
3.  Push to your configured branch (git push origin )
### Handling Failed Pushes

If a push fails (e.g., due to no internet connection), the changes will be committed locally but remain unpushed. When your internet connection is restored, you can try pushing again using:

```bash
qit p
```

This will run:

```bash
git push origin <branch>
```

## Configuration

### Branch Configuration

Create a qit.config.json file in your project root to customize the target branch:

```json
{
  "branch": "develop"
}
```

## Default Settings

- If no config file exists, Qit pushes to main branch
- All changes are staged using git add .
- Changes are pushed to origin remote

## Features

### Core Features

- **Single Command Operation**: Execute multiple git commands with one command
- **Configurable Branch**: Push to your preferred branch using config file
- **Smart Defaults**: Works out of the box with sensible defaults
- **Clear Feedback**: Colorful terminal output shows operation progress

### Terminal Output

- Stage changes: Blue indicators
- Commit progress: Yellow indicators
- Push status: Magenta indicators
- Success messages: Green indicators
- Error messages: Red indicators with clear descriptions

## Requirements

### System Requirements

- Node.js 14 or higher
- Git installed and configured
- Active internet connection for pushing
- A git repository initialized with a remote

### Repository Requirements

- Initialized git repository
- Configured remote repository
- Valid git credentials

## Error Handling

Qit provides clear error messages for common issues:

### Common Errors

- No Commit Message

```bash
✗ Error: Please provide a commit message
Usage: qit <commit message>
```

- git operation failure

```bash
ERROR
✗ Git operation failed: [error details]
```

### Error Prevention

- Always include a commit message
- Ensure you have internet connection before pushing
- Check that your git credentials are configured
- Verify that your repository has a remote configured

### Dependencies

- execa: Modern subprocess handling
- ansi-colors: Terminal styling
- fs & path: File system operations

## Contributing

### Getting Started

1.  Fork the repository
2.  Create a feature branch
3.  Make your changes
4.  Submit a pull request
