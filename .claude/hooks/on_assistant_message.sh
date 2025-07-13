#!/bin/bash

# Claude Code Hook: Stop task when "承認" is mentioned
# This hook checks if the assistant's message contains "承認" and stops execution

# Get the assistant's message from stdin
message=$(cat)

# Check if the message contains "承認" (approval in Japanese)
if echo "$message" | grep -q "承認"; then
    echo "🛑 Task stopped: Approval request detected"
    echo "Please review the proposed changes and provide approval before continuing."
    exit 1
fi

# If no "承認" found, continue normally
exit 0