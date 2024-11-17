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

open_dbeaver() {
    echo "Opening DBeaver..."
    dbeaver-ce &>/dev/null &
}

# Run in parallel
open_editor 
open_browser 
open_postman 
open_dbeaver 

echo "Workspace setup complete!"

# Note:
# &: for running the command in the background
# &>/dev/null: redirects both standard output and standard error to /dev/null 
#              -> prevent displaying messages

# Make the script executable: chmod +x workspace.sh
# Run the script: ./workspace.sh