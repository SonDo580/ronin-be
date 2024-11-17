#!/bin/bash

echo "Setting up your workspace..."

open_editor() {
    echo "Opening VS Code..."
    code . &>/dev/null &
}

open_browser() {
    echo "Opening the default browser..."
    xdg-open http://localhost &>/dev/null &
}

open_postman() {
    echo "Opening Postman..."
    postman &>/dev/null &
}

open_editor
open_browser
open_postman

echo "Workspace setup complete!"

# Note:
# &: for running the command in the background
# &>/dev/null: redirects the command standard output to the null device 
#              (prevent messages from being displayed)

# Make the script executable: chmod +x workspace.sh
# Run the script: ./workspace.sh