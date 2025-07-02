import re
import csv
import os
import multiprocessing as mp
from datetime import datetime
from itertools import islice

def read_digits_in_chunks(filename, chunk_size=1048576):  # 1MB chunks
    """Stream digits from a file in chunks without loading entire file into memory."""
    digit_pattern = re.compile(r'\d')
    with open(filename, 'r') as f:
        while chunk := f.read(chunk_size):
            yield ''.join(digit_pattern.findall(chunk))

def process_digit_chunk_combined(chunk, start_idx, min_year=1900, max_year=2024, track_padding=True):
    """
    Process a chunk of digits to find birthdays with various padding patterns.
    
    Parameters:
    - chunk: String of digits to process
    - start_idx: Starting index in the overall file
    - min_year/max_year: Valid year range
    - track_padding: Whether to check for padding patterns (0-4 zeros on each side)
    
    Returns:
    - Dictionary of found birthdays with statistics
    """
    results = {}
    
    # Maximum padding to check on each side (0-4)
    max_padding = 4 if track_padding else 0
    
    # Process chunk with sliding window
    for i in range(len(chunk) - 7):  # Need at least 8 digits for MMDDYYYY
        abs_idx = start_idx + i
        
        # Always check the basic 8-digit pattern
        chunk_slice = chunk[i:i+8]
        
        # Only proceed if it starts with a valid month digit
        if not (chunk_slice[0] == '0' or chunk_slice[0] == '1'):
            continue  # month must start with 0 or 1
        
        # Only proceed if it has a valid day digit
        if not (chunk_slice[2] == '0' or chunk_slice[2] == '1' or chunk_slice[2] == '2' or chunk_slice[2] == '3'):
            continue  # day must start with 0, 1, 2, or 3
        
        # Parse the potential date
        mm, dd, yyyy = int(chunk_slice[:2]), int(chunk_slice[2:4]), int(chunk_slice[4:])
        
        # Check if it's a valid date
        if not (1 <= mm <= 12 and 1 <= dd <= 31 and min_year <= yyyy <= max_year):
            continue
            
        # Additional date validity checks
        if mm < 10 and chunk_slice[0] != '0':
            continue  # Month must have leading zero for single digits
        if dd < 10 and chunk_slice[2] != '0':
            continue  # Day must have leading zero for single digits
        if mm == 2 and dd > 29:
            continue  # February has at most 29 days
        if mm in [4, 6, 9, 11] and dd > 30:
            continue  # April, June, September, November have 30 days
        
        # We have a valid birthday - create the key
        key = f"{mm:02d}{dd:02d}{yyyy}"
        
        # Initialize entry if not exists
        if key not in results:
            results[key] = {
                "count": 0, 
                "indices": [],
                "exact_patterns": {},  # Store exact patterns like "0042419940"
                "padding_patterns": {
                    "no_padding": 0,  # Standard 8-digit
                    "left_1": 0,      # 1 zero on left
                    "right_1": 0,     # 1 zero on right
                    "left_2": 0,      # 2 zeros on left
                    "right_2": 0,     # 2 zeros on right
                    "left_3": 0,      # 3 zeros on left
                    "right_3": 0,     # 3 zeros on right
                    "left_4": 0,      # 4 zeros on left
                    "right_4": 0,     # 4 zeros on right
                    "both_1": 0,      # 1 zero on each side
                    "both_2": 0,      # 2 zeros on each side
                    "both_3": 0,      # 3 zeros on each side
                    "both_4": 0,      # 4 zeros on each side
                }
            }
        
        # Record this standard (non-padded) occurrence
        results[key]["count"] += 1
        results[key]["indices"].append(abs_idx)
        results[key]["padding_patterns"]["no_padding"] += 1
        
        # Store the exact pattern (without padding for standard occurrence)
        exact_pattern = chunk_slice
        if exact_pattern not in results[key]["exact_patterns"]:
            results[key]["exact_patterns"][exact_pattern] = 0
        results[key]["exact_patterns"][exact_pattern] += 1
        
        # If padding tracking is enabled and there's enough room to check
        if track_padding:
            # Check for left padding (1-4 zeros)
            for left_pad in range(1, max_padding + 1):
                if i >= left_pad:
                    # Check if there are 'left_pad' zeros to the left
                    left_zeros = True
                    for p in range(left_pad):
                        if i-p-1 < 0 or chunk[i-p-1] != '0':
                            left_zeros = False
                            break
                    
                    if left_zeros:
                        # Left padding found - update count
                        results[key]["padding_patterns"][f"left_{left_pad}"] += 1
                        
                        # Now check for right padding (1-4 zeros)
                        for right_pad in range(1, max_padding + 1):
                            if i + 8 + right_pad <= len(chunk):
                                # Check if there are 'right_pad' zeros to the right
                                right_zeros = True
                                for p in range(right_pad):
                                    if chunk[i+8+p] != '0':
                                        right_zeros = False
                                        break
                                
                                if right_zeros:
                                    # Both sides padded
                                    results[key]["padding_patterns"][f"both_{min(left_pad, right_pad)}"] += 1
                                    
                                    # Create exact pattern string with padding
                                    exact_padded = '0' * left_pad + chunk_slice + '0' * right_pad
                                    if exact_padded not in results[key]["exact_patterns"]:
                                        results[key]["exact_patterns"][exact_padded] = 0
                                    results[key]["exact_patterns"][exact_padded] += 1
            
            # Check for right padding only (if no left padding)
            for right_pad in range(1, max_padding + 1):
                if i + 8 + right_pad <= len(chunk):
                    # Check if there are 'right_pad' zeros to the right
                    right_zeros = True
                    for p in range(right_pad):
                        if chunk[i+8+p] != '0':
                            right_zeros = False
                            break
                    
                    if right_zeros:
                        # Right padding found - update count
                        results[key]["padding_patterns"][f"right_{right_pad}"] += 1
                        
                        # Create exact pattern with right padding only
                        exact_right_padded = chunk_slice + '0' * right_pad
                        if exact_right_padded not in results[key]["exact_patterns"]:
                            results[key]["exact_patterns"][exact_right_padded] = 0
                        results[key]["exact_patterns"][exact_right_padded] += 1
    
    return results

def merge_results_with_padding(results_list):
    """Merge results from multiple chunks, maintaining padding statistics."""
    merged = {}
    
    for results in results_list:
        for key, info in results.items():
            if key not in merged:
                # Initialize new entry with same structure
                merged[key] = {
                    "count": 0,
                    "indices": [],
                    "exact_patterns": {},
                    "padding_patterns": {
                        "no_padding": 0,
                        "left_1": 0, "right_1": 0,
                        "left_2": 0, "right_2": 0,
                        "left_3": 0, "right_3": 0,
                        "left_4": 0, "right_4": 0,
                        "both_1": 0, "both_2": 0, 
                        "both_3": 0, "both_4": 0,
                    }
                }
            
            # Add counts
            merged[key]["count"] += info["count"]
            merged[key]["indices"].extend(info["indices"])
            
            # Add padding pattern counts
            for pattern, count in info["padding_patterns"].items():
                merged[key]["padding_patterns"][pattern] += count
            
            # Add exact pattern counts
            for pattern, count in info["exact_patterns"].items():
                if pattern not in merged[key]["exact_patterns"]:
                    merged[key]["exact_patterns"][pattern] = 0
                merged[key]["exact_patterns"][pattern] += count
    
    # Sort indices for each key
    for key in merged:
        merged[key]["indices"].sort()
        
        # Sort exact patterns by count (most frequent first)
        sorted_patterns = sorted(
            merged[key]["exact_patterns"].items(),
            key=lambda x: x[1],
            reverse=True
        )
        merged[key]["sorted_exact_patterns"] = sorted_patterns
    
    # Calculate most common padding pattern for each key
    for key, info in merged.items():
        patterns = info["padding_patterns"]
        max_pattern = max(patterns.items(), key=lambda x: x[1])
        info["most_common_padding"] = max_pattern[0]
        info["most_common_padding_count"] = max_pattern[1]
        
        # Also track if it has any significant padding
        padded_counts = sum(count for pattern, count in patterns.items() 
                           if pattern != "no_padding")
        info["has_padding"] = padded_counts > 0
        info["padding_ratio"] = padded_counts / info["count"] if info["count"] > 0 else 0
    
    return merged

def find_birthdays_in_file(filename, min_year=1900, max_year=2024, max_digits=None, 
                          chunk_size=10000000, num_processes=None, track_padding=True):
    """Find birthdays in file using parallel processing and streaming."""
    if num_processes is None:
        num_processes = max(1, mp.cpu_count() - 1)
    
    print(f"Processing {filename} using {num_processes} processes")
    
    pool = mp.Pool(num_processes)
    results_list = []
    
    total_digits = 0
    chunks = []
    start_indices = []
    
    # Read and collect chunks for processing
    for chunk in read_digits_in_chunks(filename):
        if max_digits and total_digits >= max_digits:
            break
        
        if max_digits:
            # If this chunk would exceed max_digits, truncate it
            remaining = max_digits - total_digits
            if len(chunk) > remaining:
                chunk = chunk[:remaining]
        
        if len(chunk) > 7:  # Only process chunks that could contain a birthday
            chunks.append(chunk)
            start_indices.append(total_digits)
        
        total_digits += len(chunk)
        
        if max_digits and total_digits >= max_digits:
            break
    
    print(f"Collected {len(chunks)} chunks with total {total_digits} digits")
    
    # Process chunks in parallel with the new combined function
    results_list = pool.starmap(
        process_digit_chunk_combined,
        [(chunk, idx, min_year, max_year, track_padding) 
         for chunk, idx in zip(chunks, start_indices)]
    )
    
    pool.close()
    pool.join()
    
    # Merge results from all chunks
    return merge_results_with_padding(results_list)

def calculate_odds_by_position(first_idx, sequence_length=8):
    """
    Calculate the odds of finding a specific sequence by the position where it was first found.
    
    Parameters:
    - first_idx: Position at which the sequence was first found
    - sequence_length: Length of the sequence (8 for MMDDYYYY, 10 for padded birthdays)
    
    Returns:
    - Probability of finding the specific sequence by that position
    """
    # For a specific 8-digit sequence, probability of finding it at any position is 1 in 10^8
    probability_per_position = 1 / (10 ** sequence_length)
    
    # Number of attempts made before finding the sequence
    # If position is less than sequence length, no valid attempts were made
    if first_idx < sequence_length - 1:
        return 0.0
    
    attempts = first_idx - sequence_length + 2
    
    # Probability of finding the sequence after 'attempts' tries
    return 1 - (1 - probability_per_position) ** attempts

def write_birthday_csv_with_padding(results, csv_output, prefix="", min_year=1900, max_year=2024):
    """Write birthdays to CSV with detailed padding information."""
    # Prepare sortable list of (date_obj, bday_str, info)
    sortable = []
    for bday, info in results.items():
        try:
            date_obj = datetime.strptime(bday, "%m%d%Y")
            sortable.append((date_obj, bday, info))
        except ValueError:
            continue

    # Sort by date
    sortable.sort()

    # Calculate total possible birthdays in the calendar from min_year to max_year
    total_days = 0
    for year in range(min_year, max_year + 1):
        for month in range(1, 13):
            if month == 2:
                max_day = 29
            elif month in [4, 6, 9, 11]:
                max_day = 30
            else:
                max_day = 31
            for day in range(1, max_day + 1):
                try:
                    datetime(year, month, day)
                    total_days += 1
                except ValueError:
                    continue

    # Output CSV table with human-readable columns and odds
    with open(csv_output, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            f"{prefix}Birthday (MMDDYYYY)",
            f"{prefix}Birthday (MM/DD/YYYY)",
            f"{prefix}Birthday (Month Day, Year)",
            f"{prefix}FirstIdx",
            f"{prefix}TotalCount",
            f"{prefix}Odds (by position)",
            f"{prefix}HasPadding",
            f"{prefix}TopPatterns",
            f"{prefix}NoPadding",
            f"{prefix}Left1",
            f"{prefix}Right1",
            f"{prefix}Both1",
            f"{prefix}Left2",
            f"{prefix}Right2", 
            f"{prefix}Both2",
            f"{prefix}Left3",
            f"{prefix}Right3",
            f"{prefix}Both3",
            f"{prefix}Left4",
            f"{prefix}Right4",
            f"{prefix}Both4",
            f"{prefix}Odds (on this list out of all days from {min_year} to {max_year})"
        ])
        
        for date_obj, bday, info in sortable:
            mmddyyyy = bday
            mmddyyyy_slash = date_obj.strftime("%m/%d/%Y")
            month_day_year = date_obj.strftime("%B %d, %Y")
            first_idx = info['indices'][0]
            
            # Use updated odds calculation
            # Base sequence length is 8, but adjust if most common pattern has padding
            most_common = info.get("most_common_padding", "no_padding")
            if most_common.startswith("both_"):
                padding_size = int(most_common.split("_")[1])
                sequence_length = 8 + (padding_size * 2)
            elif most_common.startswith("left_") or most_common.startswith("right_"):
                padding_size = int(most_common.split("_")[1])
                sequence_length = 8 + padding_size
            else:
                sequence_length = 8
                
            odds = calculate_odds_by_position(first_idx, sequence_length)
            
            odds_in_calendar = 1 / total_days if total_days > 0 else 0.0
            
            # Get padding patterns
            patterns = info.get("padding_patterns", {})
            
            # Get top exact patterns
            top_patterns = info.get("sorted_exact_patterns", [])
            top_patterns_str = "; ".join([
                f"{pattern}: {count}" for pattern, count in top_patterns[:5]
            ])
            
            writer.writerow([
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                first_idx,
                info['count'],
                f"{odds:.12f}",
                info.get("has_padding", False),
                top_patterns_str,
                patterns.get("no_padding", 0),
                patterns.get("left_1", 0),
                patterns.get("right_1", 0),
                patterns.get("both_1", 0),
                patterns.get("left_2", 0),
                patterns.get("right_2", 0),
                patterns.get("both_2", 0),
                patterns.get("left_3", 0),
                patterns.get("right_3", 0),
                patterns.get("both_3", 0),
                patterns.get("left_4", 0),
                patterns.get("right_4", 0),
                patterns.get("both_4", 0),
                f"{odds_in_calendar:.12f}"
            ])
    print(f"Results with padding analysis written to {csv_output}")

def write_detailed_padding_report(results, output_file, min_year=1900, max_year=2024):
    """
    Write a detailed report showing exactly how many occurrences of each
    birthday had specific padding patterns (e.g., 0042419940, 0004241994000)
    """
    with open(output_file, 'w') as f:
        # Sort birthdays by date
        sorted_birthdays = []
        for bday, info in results.items():
            try:
                date_obj = datetime.strptime(bday, "%m%d%Y")
                sorted_birthdays.append((date_obj, bday, info))
            except ValueError:
                continue
        sorted_birthdays.sort()
        
        # Write report header
        f.write(f"DETAILED PADDING PATTERN REPORT\n")
        f.write(f"Valid years: {min_year} to {max_year}\n")
        f.write(f"Total unique birthdays found: {len(sorted_birthdays)}\n\n")
        
        # For each birthday, list its exact patterns
        for date_obj, bday, info in sorted_birthdays:
            readable_date = date_obj.strftime("%B %d, %Y")
            f.write(f"=== {bday} ({readable_date}) ===\n")
            f.write(f"Total occurrences: {info['count']}\n")
            f.write(f"First found at position: {info['indices'][0]}\n")
            
            # List exact patterns sorted by count
            f.write("Exact patterns found:\n")
            if "sorted_exact_patterns" in info:
                for pattern, count in info["sorted_exact_patterns"]:
                    padding_desc = ""
                    if len(pattern) > 8:
                        left_pad = pattern.find(bday)
                        right_pad = len(pattern) - left_pad - 8
                        if left_pad > 0 and right_pad > 0:
                            padding_desc = f" ({left_pad} zeros left, {right_pad} zeros right)"
                        elif left_pad > 0:
                            padding_desc = f" ({left_pad} zeros left)"
                        elif right_pad > 0:
                            padding_desc = f" ({right_pad} zeros right)"
                    f.write(f"  {pattern}: {count} occurrences{padding_desc}\n")
            f.write("\n")
    
    print(f"Detailed padding pattern report written to {output_file}")

def write_detailed_padding_csv(results, csv_output, prefix="", min_year=1900, max_year=2024, max_padding=4):
    """
    Write a detailed CSV report of all birthdays with their padding patterns.
    Focus on just the important padding patterns with 0-4 zeros.
    """
    # Prepare sortable list of (date_obj, bday_str, info)
    sortable = []
    for bday, info in results.items():
        try:
            date_obj = datetime.strptime(bday, "%m%d%Y")
            sortable.append((date_obj, bday, info))
        except ValueError:
            continue

    # Sort by date
    sortable.sort()

    # Calculate total possible birthdays in the calendar from min_year to max_year
    total_days = 0
    for year in range(min_year, max_year + 1):
        for month in range(1, 13):
            if month == 2:
                max_day = 29
            elif month in [4, 6, 9, 11]:
                max_day = 30
            else:
                max_day = 31
            for day in range(1, max_day + 1):
                try:
                    datetime(year, month, day)
                    total_days += 1
                except ValueError:
                    continue
    
    # Output CSV table
    with open(csv_output, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        
        # Write header row with simple padding columns
        header = [
            f"{prefix}Birthday (MMDDYYYY)",
            f"{prefix}Birthday (MM/DD/YYYY)",
            f"{prefix}Birthday (Month Day, Year)",
            f"{prefix}TotalCount",
            f"{prefix}FirstIdx",
            f"{prefix}Odds (by position)",
            f"{prefix}Odds (calendar)",
            f"{prefix}NoPrefix",  # No padding prefix
            f"{prefix}0",         # Single 0 prefix
            f"{prefix}00",        # Double 0 prefix
            f"{prefix}000",       # Triple 0 prefix
            f"{prefix}0000",      # Quadruple 0 prefix
        ]
        
        writer.writerow(header)
        
        # Write each birthday's data
        for date_obj, bday, info in sortable:
            mmddyyyy = bday
            mmddyyyy_slash = date_obj.strftime("%m/%d/%Y")
            month_day_year = date_obj.strftime("%B %d, %Y")
            first_idx = info['indices'][0]
            total_count = info['count']
            
            # Calculate odds
            sequence_length = 8  # Base length
            odds = calculate_odds_by_position(first_idx, sequence_length)
            odds_in_calendar = 1 / total_days if total_days > 0 else 0.0
            
            # Count patterns with different prefixes
            exact_patterns = info.get("exact_patterns", {})
            
            # Count occurrences with different padding prefixes
            no_prefix_count = 0
            prefix_0_count = 0
            prefix_00_count = 0
            prefix_000_count = 0
            prefix_0000_count = 0
            
            for pattern, count in exact_patterns.items():
                prefix_len = 0
                if pattern.startswith('0'):
                    # Count zeros at the beginning
                    for char in pattern:
                        if char == '0':
                            prefix_len += 1
                        else:
                            break
                            
                    # If the entire pattern is zeros, adjust
                    if prefix_len == len(pattern):
                        prefix_len = 0
                
                # Categorize by prefix length
                if prefix_len == 0:
                    no_prefix_count += count
                elif prefix_len == 1:
                    prefix_0_count += count
                elif prefix_len == 2:
                    prefix_00_count += count
                elif prefix_len == 3:
                    prefix_000_count += count
                elif prefix_len >= 4:
                    prefix_0000_count += count
            
            # Write the row
            row = [
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                total_count,
                first_idx,
                f"{odds:.12f}",
                f"{odds_in_calendar:.12f}",
                no_prefix_count,
                prefix_0_count,
                prefix_00_count,
                prefix_000_count,
                prefix_0000_count,
            ]
            
            writer.writerow(row)
    
    print(f"Detailed padding pattern CSV written to {csv_output}")

def write_intersection_with_padding_csv(results1, results2, csv_output, prefix1="", prefix2="", 
                                       min_year=1900, max_year=2024):
    """Write intersection results with simple padding information in CSV format."""
    # Prepare sortable list
    sortable = []
    for bday, info1 in results1.items():
        if bday in results2:
            info2 = results2[bday]
            try:
                date_obj = datetime.strptime(bday, "%m%d%Y")
                sortable.append((date_obj, bday, info1, info2))
            except ValueError:
                continue
    
    sortable.sort()
    
    # Calculate total possible birthdays
    total_days = 0
    for year in range(min_year, max_year + 1):
        for month in range(1, 13):
            if month == 2:
                max_day = 29
            elif month in [4, 6, 9, 11]:
                max_day = 30
            else:
                max_day = 31
            for day in range(1, max_day + 1):
                try:
                    datetime(year, month, day)
                    total_days += 1
                except ValueError:
                    continue
    
    # Write CSV
    with open(csv_output, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        
        # Create header row with simplified padding columns
        header = [
            "Birthday (MMDDYYYY)",
            "Birthday (MM/DD/YYYY)",
            "Birthday (Month Day, Year)",
            f"{prefix1}TotalCount",
            f"{prefix1}FirstIdx",
            f"{prefix1}Odds",
            f"{prefix2}TotalCount",
            f"{prefix2}FirstIdx",
            f"{prefix2}Odds",
            "Odds (calendar)",
            # First file padding columns
            f"{prefix1}NoPrefix",
            f"{prefix1}0",
            f"{prefix1}00",
            f"{prefix1}000",
            f"{prefix1}0000",
            # Second file padding columns
            f"{prefix2}NoPrefix",
            f"{prefix2}0",
            f"{prefix2}00",
            f"{prefix2}000",
            f"{prefix2}0000",
        ]
        
        writer.writerow(header)
        
        # Write data rows
        for date_obj, bday, info1, info2 in sortable:
            mmddyyyy = bday
            mmddyyyy_slash = date_obj.strftime("%m/%d/%Y")
            month_day_year = date_obj.strftime("%B %d, %Y")
            
            # Extract basic data
            first_idx1 = info1['indices'][0]
            first_idx2 = info2['indices'][0]
            count1 = info1['count']
            count2 = info2['count']
            
            # Calculate odds
            odds1 = calculate_odds_by_position(first_idx1, 8)
            odds2 = calculate_odds_by_position(first_idx2, 8)
            odds_in_calendar = 1 / total_days if total_days > 0 else 0.0
            
            # Count patterns by prefix length for file 1
            exact_patterns1 = info1.get("exact_patterns", {})
            no_prefix1 = 0
            prefix1_0 = 0
            prefix1_00 = 0
            prefix1_000 = 0
            prefix1_0000 = 0
            
            for pattern, count in exact_patterns1.items():
                prefix_len = 0
                if pattern.startswith('0'):
                    for char in pattern:
                        if char == '0':
                            prefix_len += 1
                        else:
                            break
                    if prefix_len == len(pattern):
                        prefix_len = 0
                        
                if prefix_len == 0:
                    no_prefix1 += count
                elif prefix_len == 1:
                    prefix1_0 += count
                elif prefix_len == 2:
                    prefix1_00 += count
                elif prefix_len == 3:
                    prefix1_000 += count
                elif prefix_len >= 4:
                    prefix1_0000 += count
            
            # Count patterns by prefix length for file 2
            exact_patterns2 = info2.get("exact_patterns", {})
            no_prefix2 = 0
            prefix2_0 = 0
            prefix2_00 = 0
            prefix2_000 = 0
            prefix2_0000 = 0
            
            for pattern, count in exact_patterns2.items():
                prefix_len = 0
                if pattern.startswith('0'):
                    for char in pattern:
                        if char == '0':
                            prefix_len += 1
                        else:
                            break
                    if prefix_len == len(pattern):
                        prefix_len = 0
                        
                if prefix_len == 0:
                    no_prefix2 += count
                elif prefix_len == 1:
                    prefix2_0 += count
                elif prefix_len == 2:
                    prefix2_00 += count
                elif prefix_len == 3:
                    prefix2_000 += count
                elif prefix_len >= 4:
                    prefix2_0000 += count
            
            # Build the row
            row = [
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                count1,
                first_idx1,
                f"{odds1:.12f}",
                count2,
                first_idx2,
                f"{odds2:.12f}",
                f"{odds_in_calendar:.12f}",
                no_prefix1,
                prefix1_0,
                prefix1_00,
                prefix1_000,
                prefix1_0000,
                no_prefix2,
                prefix2_0,
                prefix2_00,
                prefix2_000,
                prefix2_0000,
            ]
            
            writer.writerow(row)
    
    print(f"Intersection with padding patterns written to {csv_output}")

# Update main function to use the new CSV format
if __name__ == "__main__":
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description="Find birthdays in number sequences within files")
    parser.add_argument("files", nargs="+", help="One or two input files to process")
    parser.add_argument("--start-year", type=int, default=1900, help="Minimum year to consider as valid")
    parser.add_argument("--max-year", type=int, default=2024, help="Maximum year to consider as valid")
    parser.add_argument("--max-digits", type=int, help="Maximum number of digits to process from each file")
    parser.add_argument("--processes", type=int, help="Number of parallel processes to use")
    parser.add_argument("--chunk-size", type=int, default=10000000, help="Size of chunks to process at once")
    parser.add_argument("--no-padding", action="store_true", help="Disable padding analysis")
    
    args = parser.parse_args()
    
    if len(args.files) < 1 or len(args.files) > 2:
        parser.error("Please provide one or two input files")
    
    min_year = args.start_year
    max_year = args.max_year
    max_digits = args.max_digits
    num_processes = args.processes
    chunk_size = args.chunk_size
    track_padding = not args.no_padding
    
    print(f"Processing files with years {min_year}-{max_year}" + 
          (f", max {max_digits} digits" if max_digits else "") +
          (f", {num_processes} processes" if num_processes else "") +
          (", with padding analysis" if track_padding else ", no padding analysis"))
    
    input_path1 = args.files[0]
    input_base1 = os.path.basename(input_path1).rsplit(".", 1)[0]
    
    # Generate CSV reports with consistent padding pattern format
    max_padding = 4  # Maximum number of zeros to check on each side
    
    # Process first file
    print(f"Finding birthdays in {input_path1}...")
    results1 = find_birthdays_in_file(
        input_path1, min_year=min_year, max_year=max_year,
        max_digits=max_digits, num_processes=num_processes, 
        chunk_size=chunk_size, track_padding=track_padding
    )
    
    # Generate detailed CSV report for first file
    detailed_csv1 = f"{input_base1}_padding_patterns.csv"
    write_detailed_padding_csv(
        results1, detailed_csv1, prefix=f"{input_base1}_", 
        min_year=min_year, max_year=max_year, max_padding=max_padding
    )
    
    # Generate text report for first file too (for easy reading)
    detailed_report1 = f"{input_base1}_detailed_padding_patterns.txt"
    write_detailed_padding_report(results1, detailed_report1, min_year=min_year, max_year=max_year)
    
    if len(args.files) == 1:
        # Only processing one file
        print(f"Processing complete for {input_path1}")
    else:
        # Process second file
        input_path2 = args.files[1]
        input_base2 = os.path.basename(input_path2).rsplit(".", 1)[0]
        
        print(f"Finding birthdays in {input_path2}...")
        results2 = find_birthdays_in_file(
            input_path2, min_year=min_year, max_year=max_year,
            max_digits=max_digits, num_processes=num_processes, 
            chunk_size=chunk_size, track_padding=track_padding
        )
        
        # Generate detailed CSV report for second file
        detailed_csv2 = f"{input_base2}_padding_patterns.csv"
        write_detailed_padding_csv(
            results2, detailed_csv2, prefix=f"{input_base2}_", 
            min_year=min_year, max_year=max_year, max_padding=max_padding
        )
        
        # Generate text report for second file too
        detailed_report2 = f"{input_base2}_detailed_padding_patterns.txt"
        write_detailed_padding_report(results2, detailed_report2, min_year=min_year, max_year=max_year)
        
        # Write intersection report with consistent padding patterns
        intersection = set(results1.keys()) & set(results2.keys())
        if intersection:
            intersection_csv = f"{input_base1}_AND_{input_base2}_padding_patterns.csv"
            write_intersection_with_padding_csv(
                {k: results1[k] for k in intersection},
                {k: results2[k] for k in intersection},
                intersection_csv,
                prefix1=f"{input_base1}_", 
                prefix2=f"{input_base2}_",
                min_year=min_year, 
                max_year=max_year,
                max_padding=max_padding
            )
        else:
            print("No birthdays found in both files.")