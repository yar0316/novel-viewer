#!/bin/bash

# Read the last assistant message
last_message=$(cat ~/.claude/last_assistant_message.txt 2>/dev/null || echo "")

# Path to rules file
rules_file=".claude/hooks/rules/hook_stop_words_rules.json"

# Check if rules file exists
if [[ ! -f "$rules_file" ]]; then
    exit 0
fi

# Read and parse rules
while IFS= read -r line; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Extract rule data
    rule_name=$(echo "$line" | jq -r '.rule_name // empty')
    keywords=$(echo "$line" | jq -r '.keywords[]? // empty')
    message=$(echo "$line" | jq -r '.message // empty')
    
    # Skip if any required field is missing
    [[ -z "$rule_name" || -z "$keywords" || -z "$message" ]] && continue
    
    # Check if any keyword is found in the message
    for keyword in $keywords; do
        if echo "$last_message" | grep -q "$keyword"; then
            echo "🛑 Task stopped by rule: $rule_name"
            echo "$message"
            exit 1
        fi
    done
done < <(jq -c '.[]' "$rules_file" 2>/dev/null)

exit 0