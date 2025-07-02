import re
import csv
from datetime import datetime

def find_birthdays_in_file(filename, min_year=1900, max_year=2024):
    # Compile regex for MMDDYYYY (allow leading zeros)
    birthday_re = re.compile(r'(\d{8})')
    results = {}
    with open(filename, 'r') as f:
        content = f.read()
        digits = ''.join(re.findall(r'\d', content))

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
            # No padded logic here, just collect normal 8-digit birthdays
            if key not in results:
                results[key] = {"count": 0, "indices": []}
            results[key]["count"] += 1
            results[key]["indices"].append(i)
    return results

def find_padded_birthdays_in_file(filename, min_year=1900, max_year=2024):
    # Looks for 10-digit sequences where first and last digit are 0, and the middle 8 are a valid birthday
    results = {}
    with open(filename, 'r') as f:
        content = f.read()
        digits = ''.join(re.findall(r'\d', content))

    for i in range(len(digits) - 9):
        chunk = digits[i:i+10]
        if chunk[0] == '0' and chunk[-1] == '0':
            middle = chunk[1:9]
            mm, dd, yyyy = int(middle[:2]), int(middle[2:4]), int(middle[4:])
            if 1 <= mm <= 12 and 1 <= dd <= 31 and min_year <= yyyy <= max_year:
                if mm < 10 and middle[0] != '0':
                    continue
                if dd < 10 and middle[2] != '0':
                    continue
                if mm == 2 and dd > 29:
                    continue
                if mm in [4, 6, 9, 11] and dd > 30:
                    continue
                key = f"{mm:02d}{dd:02d}{yyyy}"
                if key not in results:
                    results[key] = {"count": 0, "indices": []}
                results[key]["count"] += 1
                results[key]["indices"].append(i)
    return results

def write_birthday_csv(results, csv_output, prefix="", min_year=1900, max_year=2024):
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
            f"{prefix}Count",
            f"{prefix}Odds (by position)",
            f"{prefix}Padded",
            f"{prefix}Odds (on this list out of all days from {min_year} to {max_year})"
        ])
        for date_obj, bday, info in sortable:
            mmddyyyy = bday
            mmddyyyy_slash = date_obj.strftime("%m/%d/%Y")
            month_day_year = date_obj.strftime("%B %d, %Y")
            first_idx = info['indices'][0]
            N = first_idx + 8
            if N < 8:
                odds = 0.0
            else:
                tries = N - 8 + 1
                odds = 1 - (1 - 1/1e8) ** tries
            odds_in_calendar = 1 / total_days if total_days > 0 else 0.0
            writer.writerow([
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                first_idx,
                info['count'],
                f"{odds:.12f}",
                info.get("padded", False),
                f"{odds_in_calendar:.12f}"
            ])
    print(f"Results written to {csv_output}")

def write_intersection_csv(results1, results2, csv_output, prefix1="", prefix2="", min_year=1900, max_year=2024):
    # padded_mode: None = all, True = only padded, False = only non-padded
    intersection = set(results1.keys()) & set(results2.keys())
    sortable = []
    for bday in intersection:
        try:
            date_obj = datetime.strptime(bday, "%m%d%Y")
            sortable.append((date_obj, bday))
        except ValueError:
            continue
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
    with open(csv_output, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            f"{prefix1}Birthday (MMDDYYYY)",
            f"{prefix1}Birthday (MM/DD/YYYY)",
            f"{prefix1}Birthday (Month Day, Year)",
            f"{prefix1}FirstIdx",
            f"{prefix1}Count",
            f"{prefix1}Odds (by position)",
            f"{prefix2}FirstIdx",
            f"{prefix2}Count",
            f"{prefix2}Odds (by position)",
            f"Odds (on this list out of all days from {min_year} to {max_year})"
        ])
        for date_obj, bday in sortable:
            info1 = results1[bday]
            info2 = results2[bday]
            first_idx1 = info1['indices'][0]
            N1 = first_idx1 + 8
            tries1 = N1 - 8 + 1 if N1 >= 8 else 0
            odds1 = 1 - (1 - 1/1e8) ** tries1 if tries1 > 0 else 0.0
            first_idx2 = info2['indices'][0]
            N2 = first_idx2 + 8
            tries2 = N2 - 8 + 1 if N2 >= 8 else 0
            odds2 = 1 - (1 - 1/1e8) ** tries2 if tries2 > 0 else 0.0
            mmddyyyy = bday
            mmddyyyy_slash = date_obj.strftime("%m/%d/%Y")
            month_day_year = date_obj.strftime("%B %d, %Y")
            odds_in_calendar = 1 / total_days if total_days > 0 else 0.0
            writer.writerow([
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                first_idx1,
                info1['count'],
                f"{odds1:.12f}",
                first_idx2,
                info2['count'],
                f"{odds2:.12f}",
                f"{odds_in_calendar:.12f}"
            ])
    print(f"Intersection results written to {csv_output}")

def write_padded_union_intersection_csv(results1, results2, csv_output, prefix1="", prefix2="", min_year=1900, max_year=2024):
    # Write intersection for birthdays present in both files, where at least one is padded
    keys1 = set(results1.keys())
    keys2 = set(results2.keys())
    intersection = keys1 & keys2
    sortable = []
    for bday in intersection:
        padded1 = results1[bday].get("padded", False)
        padded2 = results2[bday].get("padded", False)
        # Only include if either is padded
        if padded1 or padded2:
            try:
                date_obj = datetime.strptime(bday, "%m%d%Y")
                sortable.append((date_obj, bday, padded1, padded2))
            except ValueError:
                continue
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
    with open(csv_output, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            f"{prefix1}Birthday (MMDDYYYY)",
            f"{prefix1}Birthday (MM/DD/YYYY)",
            f"{prefix1}Birthday (Month Day, Year)",
            f"{prefix1}FirstIdx",
            f"{prefix1}Count",
            f"{prefix1}Odds (by position)",
            f"{prefix1}Padded",
            f"{prefix2}FirstIdx",
            f"{prefix2}Count",
            f"{prefix2}Odds (by position)",
            f"{prefix2}Padded",
            "PaddedInEither",
            "PaddedInBoth",
            f"Odds (on this list out of all days from {min_year} to {max_year})"
        ])
        for date_obj, bday, padded1, padded2 in sortable:
            info1 = results1[bday]
            info2 = results2[bday]
            first_idx1 = info1['indices'][0]
            N1 = first_idx1 + 8
            tries1 = N1 - 8 + 1 if N1 >= 8 else 0
            odds1 = 1 - (1 - 1/1e8) ** tries1 if tries1 > 0 else 0.0
            first_idx2 = info2['indices'][0]
            N2 = first_idx2 + 8
            tries2 = N2 - 8 + 1 if N2 >= 8 else 0
            odds2 = 1 - (1 - 1/1e8) ** tries2 if tries2 > 0 else 0.0
            mmddyyyy = bday
            mmddyyyy_slash = date_obj.strftime("%m/%d/%Y")
            month_day_year = date_obj.strftime("%B %d, %Y")
            padded_in_either = padded1 or padded2
            padded_in_both = padded1 and padded2
            odds_in_calendar = 1 / total_days if total_days > 0 else 0.0
            writer.writerow([
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                first_idx1,
                info1['count'],
                f"{odds1:.12f}",
                padded1,
                first_idx2,
                info2['count'],
                f"{odds2:.12f}",
                padded2,
                padded_in_either,
                padded_in_both,
                f"{odds_in_calendar:.12f}"
            ])
    print(f"Padded union intersection results written to {csv_output}")

if __name__ == "__main__":
    import sys
    # Parse min_year argument if present
    min_year = 1900
    max_year = 2024
    args = sys.argv[1:]
    # Check for --start-year argument
    for i, arg in enumerate(args):
        if arg.startswith("--start-year="):
            min_year = int(arg.split("=")[1])
            args.pop(i)
            break
    if len(args) < 1:
        print("Usage: python find_birthdays_in_numbers.py <filename1> [<filename2>] [--start-year=YEAR]")
    else:
        input_path1 = args[0]
        input_base1 = input_path1.split("/")[-1].rsplit(".", 1)[0]
        results1 = find_birthdays_in_file(input_path1, min_year=min_year, max_year=max_year)
        padded_results1 = find_padded_birthdays_in_file(input_path1, min_year=min_year, max_year=max_year)
        if len(args) == 1:
            csv_out1 = f"{input_base1}_birthdays_found_from_digits.csv"
            write_birthday_csv(results1, csv_out1, min_year=min_year, max_year=max_year)
            csv_out1_pad = f"{input_base1}_birthdays_found_from_digits_padded.csv"
            write_birthday_csv(padded_results1, csv_out1_pad, min_year=min_year, max_year=max_year)
        else:
            input_path2 = args[1]
            input_base2 = input_path2.split("/")[-1].rsplit(".", 1)[0]
            results2 = find_birthdays_in_file(input_path2, min_year=min_year, max_year=max_year)
            padded_results2 = find_padded_birthdays_in_file(input_path2, min_year=min_year, max_year=max_year)
            csv_out1 = f"{input_base1}_birthdays_found_from_digits.csv"
            csv_out2 = f"{input_base2}_birthdays_found_from_digits.csv"
            write_birthday_csv(results1, csv_out1, prefix=f"{input_base1}_", min_year=min_year, max_year=max_year)
            write_birthday_csv(results2, csv_out2, prefix=f"{input_base2}_", min_year=min_year, max_year=max_year)
            # Intersections for non-padded (8-digit) birthdays
            intersection = set(results1.keys()) & set(results2.keys())
            if intersection:
                csv_out_inter = f"{input_base1}_AND_{input_base2}_birthdays_intersection_nonpadded.csv"
                write_intersection_csv(
                    {k: results1[k] for k in intersection},
                    {k: results2[k] for k in intersection},
                    csv_out_inter,
                    prefix1=f"{input_base1}_", prefix2=f"{input_base2}_",
                    min_year=min_year, max_year=max_year
                )
            else:
                print("No non-padded birthdays found in both files.")
            # Intersections for padded (union: either file is padded)
            all_results1 = find_birthdays_in_file(input_path1, min_year=min_year, max_year=max_year)
            for k, v in find_padded_birthdays_in_file(input_path1, min_year=min_year, max_year=max_year).items():
                v = dict(v)
                v["padded"] = True
                all_results1[k] = v
            all_results2 = find_birthdays_in_file(input_path2, min_year=min_year, max_year=max_year)
            for k, v in find_padded_birthdays_in_file(input_path2, min_year=min_year, max_year=max_year).items():
                v = dict(v)
                v["padded"] = True
                all_results2[k] = v
            csv_out_inter_pad = f"{input_base1}_AND_{input_base2}_birthdays_intersection_padded.csv"
            write_padded_union_intersection_csv(
                all_results1, all_results2, csv_out_inter_pad,
                prefix1=f"{input_base1}_", prefix2=f"{input_base2}_",
                min_year=min_year, max_year=max_year
            )