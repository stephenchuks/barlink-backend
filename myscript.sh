#!/bin/bash

# Function to process directories recursively
process_directory() {
    local dir="$1"
    # Display directory header
    echo -e "\n\033[32m=== DIRECTORY: $dir ===\033[0m"
    
    # List directory contents
    ls -l "$dir"
    
    # Process files
    echo -e "\n\033[33m[FILE CONTENTS]\033[0m"
    while IFS= read -r -d $'\0' file; do
        local file_abs="$file"
        # Compute relative path by removing root_dir prefix and any leading slash
        local rel_path="${file_abs#$root_dir}"
        rel_path="${rel_path#/}"
        local exclude=0
        
        # Check against exclusion patterns
        for pattern in "${exclude_patterns[@]}"; do
            if [[ "$pattern" == */* ]]; then
                # Pattern contains slash: full path match
                if [[ "$rel_path" == "$pattern" ]]; then
                    exclude=1
                    break
                fi
            else
                # Pattern without slash: base name match
                if [[ "$(basename "$file_abs")" == "$pattern" ]]; then
                    exclude=1
                    break
                fi
            fi
        done
        
        if [[ $exclude -eq 0 ]]; then
            echo -e "\n\033[36m---- $rel_path ----\033[0m"
            cat "$file"
        fi
    done < <(find "$dir" -maxdepth 1 -type f -print0)
    
    # Process subdirectories
    while IFS= read -r -d $'\0' subdir; do
        local subdir_abs="$subdir"
        # Compute relative path by removing root_dir prefix and any leading slash
        local rel_path="${subdir_abs#$root_dir}"
        rel_path="${rel_path#/}"
        local exclude=0
        
        # Check against exclusion patterns
        for pattern in "${exclude_patterns[@]}"; do
            if [[ "$pattern" == */* ]]; then
                # Pattern contains slash: full path match
                if [[ "$rel_path" == "$pattern" ]]; then
                    exclude=1
                    break
                fi
            else
                # Pattern without slash: base name match
                if [[ "$(basename "$subdir_abs")" == "$pattern" ]]; then
                    exclude=1
                    break
                fi
            fi
        done
        
        if [[ $exclude -eq 0 ]]; then
            process_directory "$subdir"
        fi
    done < <(find "$dir" -mindepth 1 -maxdepth 1 -type d -print0)
}

# Check for root directory argument
if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <root_directory> [--exclude pattern1 pattern2 ...] [--output output_file]" >&2
    exit 1
fi

# Get absolute path of root directory
root_dir="$(cd -- "$1" && pwd)"
shift
exclude_patterns=()
output_file=""

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --exclude)
            shift
            # Read all exclusion patterns until next option or end
            while [[ $# -gt 0 && "$1" != --* ]]; do
                exclude_patterns+=("$1")
                shift
            done
            ;;
        --output)
            shift
            if [[ $# -gt 0 ]]; then
                output_file="$1"
                shift
            else
                echo "Error: Missing filename for --output" >&2
                exit 1
            fi
            ;;
        *)
            echo "Error: Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Verify directory exists
if [[ ! -d "$root_dir" ]]; then
    echo "Error: Directory '$root_dir' does not exist" >&2
    exit 1
fi

# Redirect output if output file is specified
if [[ -n "$output_file" ]]; then
    # Create/truncate the file
    : > "$output_file"
    # Redirect stdout and stderr to tee
    exec > >(tee -a "$output_file") 2>&1
fi

# Start processing
process_directory "$root_dir"
