#!/bin/bash

# Script to add frontmatter title field and remove duplicate H1 headings
# Only processes the first 30 lines to avoid unintended changes

process_file() {
    local file="$1"

    # Skip SUMMARY.md
    if [[ "$file" == *"SUMMARY.md"* ]]; then
        return
    fi

    # Read first 30 lines
    local content=$(head -n 30 "$file")

    # Check if file has frontmatter
    if [[ "$content" =~ ^---[[:space:]]*$ ]]; then
        # Extract frontmatter section (between first two ---)
        local frontmatter=$(awk '/^---$/{if(++n==2) exit; next} n==1' "$file")

        # Check if title field exists
        if ! echo "$frontmatter" | grep -q "^title:"; then
            # Get first H1 heading after frontmatter (if exists)
            local h1_line=$(awk '/^---$/{if(++n==2){getline; while(getline && /^[[:space:]]*$/); if(/^# /) print; exit}}' "$file")

            if [[ -n "$h1_line" ]]; then
                # Extract title from H1
                local title=$(echo "$h1_line" | sed 's/^# //')

                # Add title to frontmatter and remove the H1 line
                awk -v title="$title" '
                    BEGIN {in_fm=0; fm_count=0; h1_removed=0}
                    /^---$/ {
                        fm_count++
                        if(fm_count==1) {in_fm=1; print; next}
                        if(fm_count==2) {
                            print "title: " title
                            in_fm=0
                            print
                            next
                        }
                    }
                    in_fm {print; next}
                    !h1_removed && fm_count==2 && /^[[:space:]]*$/ {print; next}
                    !h1_removed && fm_count==2 && /^# / {
                        h1_removed=1
                        next
                    }
                    {print}
                ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

                echo "Processed: $file (added title and removed H1)"
            else
                echo "Skipped: $file (no H1 found to use as title)"
            fi
        else
            # Title exists, check if H1 needs to be removed
            local title=$(echo "$frontmatter" | grep "^title:" | sed 's/^title:[[:space:]]*//')
            local h1_line=$(awk '/^---$/{if(++n==2){getline; while(getline && /^[[:space:]]*$/); if(/^# /) print; exit}}' "$file")

            if [[ -n "$h1_line" ]]; then
                local h1_title=$(echo "$h1_line" | sed 's/^# //')

                # Remove H1 if it matches or is similar to title
                awk '
                    BEGIN {in_fm=0; fm_count=0; h1_removed=0}
                    /^---$/ {fm_count++; print; next}
                    fm_count<2 {print; next}
                    !h1_removed && /^[[:space:]]*$/ {print; next}
                    !h1_removed && /^# / {
                        h1_removed=1
                        next
                    }
                    {print}
                ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

                echo "Processed: $file (removed duplicate H1)"
            fi
        fi
    else
        echo "Skipped: $file (no frontmatter)"
    fi
}

# Process files
for file in "$@"; do
    if [ -f "$file" ]; then
        process_file "$file"
    fi
done
