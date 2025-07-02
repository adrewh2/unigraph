import re
import csv
from datetime import datetime

def find_birthdays_in_file(filename, min_year=1900, max_year=2024, csv_output="birthdays_found.csv"):
    # Compile regex for MMDDYYYY (allow leading zeros)
    birthday_re = re.compile(r'(\d{8})')
    results = {}

    # Read file and extract all digit characters
    with open(filename, 'r') as f:
        content = f.read()
        digits = ''.join(re.findall(r'\d', content))

    # Scan for all 8-digit substrings
    for i in range(len(digits) - 7):
        chunk = digits[i:i+8]
        # Only accept months/days with leading zeros if single digit
        if not (chunk[0] == '0' or chunk[0] == '1'):
            continue  # month must start with 0 or 1
        if not (chunk[2] == '0' or chunk[2] == '1' or chunk[2] == '2' or chunk[2] == '3'):
            continue  # day must start with 0, 1, 2, or 3
        mm, dd, yyyy = int(chunk[:2]), int(chunk[2:4]), int(chunk[4:])
        # Check valid month, day, year
        if 1 <= mm <= 12 and 1 <= dd <= 31 and min_year <= yyyy <= max_year:
            # Only count if month and day have leading zeros for single digits
            if mm < 10 and chunk[0] != '0':
                continue
            if dd < 10 and chunk[2] != '0':
                continue
            # Extra: check for valid day in month (not perfect, but better)
            if mm == 2 and dd > 29:
                continue
            if mm in [4, 6, 9, 11] and dd > 30:
                continue
            key = f"{mm:02d}{dd:02d}{yyyy}"
            if key not in results:
                results[key] = {"count": 0, "indices": []}
            results[key]["count"] += 1
            results[key]["indices"].append(i)

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

    # Output CSV table with human-readable columns and odds
    with open(csv_output, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            "Birthday (MMDDYYYY)",
            "Birthday (MM/DD/YYYY)",
            "Birthday (Month Day, Year)",
            "FirstIdx",
            "Count",
            "Odds (by position)"
        ])
        for date_obj, bday, info in sortable:
            mmddyyyy = bday
            mmddyyyy_slash = date_obj.strftime("%m/%d/%Y")
            month_day_year = date_obj.strftime("%B %d, %Y")
            first_idx = info['indices'][0]
            # Needle-in-haystack odds calculation
            N = first_idx + 8
            if N < 8:
                odds = 0.0
            else:
                tries = N - 8 + 1
                odds = 1 - (1 - 1/1e8) ** tries
            writer.writerow([
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                first_idx,
                info['count'],
                f"{odds:.12f}"
            ])
    print(f"Results written to {csv_output}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python find_birthdays_in_numbers.py <filename> [csv_output]")
    else:
        input_path = sys.argv[1]
        input_base = input_path.split("/")[-1].rsplit(".", 1)[0]
        if len(sys.argv) > 2:
            csv_out = sys.argv[2]
        else:
            base = f"{input_base}_birthdays_found_from_digits"
            ext = ".csv"
            csv_out = f"{base}{ext}"
        find_birthdays_in_file(input_path, csv_output=csv_out)