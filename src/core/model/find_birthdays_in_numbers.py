import re
import csv
from datetime import datetime

def find_birthdays_in_file(filename, min_year=1900, max_year=2024):
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

    return results

def write_birthday_csv(results, csv_output, prefix=""):
    # Prepare sortable list of (date_obj, bday_str, info)
    sortable = []
    for bday, info in results.items():
        try:
            date_obj = datetime.strptime(bday, "%m%d%Y")
            sortable.append((date_obj, bday, info))
        except ValueError:
            continue
    sortable.sort()
    # Output CSV table with human-readable columns and odds
    with open(csv_output, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            f"{prefix}Birthday (MMDDYYYY)",
            f"{prefix}Birthday (MM/DD/YYYY)",
            f"{prefix}Birthday (Month Day, Year)",
            f"{prefix}FirstIdx",
            f"{prefix}Count",
            f"{prefix}Odds (by position)"
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
            writer.writerow([
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                first_idx,
                info['count'],
                f"{odds:.12f}"
            ])
    print(f"Results written to {csv_output}")

def write_intersection_csv(results1, results2, csv_output, prefix1="", prefix2=""):
    # Find intersection of birthdays
    common = set(results1.keys()) & set(results2.keys())
    sortable = []
    for bday in common:
        try:
            date_obj = datetime.strptime(bday, "%m%d%Y")
            sortable.append((date_obj, bday))
        except ValueError:
            continue
    sortable.sort()
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
            f"{prefix2}Odds (by position)"
        ])
        for date_obj, bday in sortable:
            # File 1
            info1 = results1[bday]
            first_idx1 = info1['indices'][0]
            N1 = first_idx1 + 8
            tries1 = N1 - 8 + 1 if N1 >= 8 else 0
            odds1 = 1 - (1 - 1/1e8) ** tries1 if tries1 > 0 else 0.0
            # File 2
            info2 = results2[bday]
            first_idx2 = info2['indices'][0]
            N2 = first_idx2 + 8
            tries2 = N2 - 8 + 1 if N2 >= 8 else 0
            odds2 = 1 - (1 - 1/1e8) ** tries2 if tries2 > 0 else 0.0
            mmddyyyy = bday
            mmddyyyy_slash = date_obj.strftime("%m/%d/%Y")
            month_day_year = date_obj.strftime("%B %d, %Y")
            writer.writerow([
                mmddyyyy,
                mmddyyyy_slash,
                month_day_year,
                first_idx1,
                info1['count'],
                f"{odds1:.12f}",
                first_idx2,
                info2['count'],
                f"{odds2:.12f}"
            ])
    print(f"Intersection results written to {csv_output}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python find_birthdays_in_numbers.py <filename1> [<filename2>] [csv_output1] [csv_output2]")
    else:
        input_path1 = sys.argv[1]
        input_base1 = input_path1.split("/")[-1].rsplit(".", 1)[0]
        results1 = find_birthdays_in_file(input_path1)
        if len(sys.argv) == 2:
            csv_out1 = f"{input_base1}_birthdays_found_from_digits.csv"
            write_birthday_csv(results1, csv_out1)
        elif len(sys.argv) == 3:
            input_path2 = sys.argv[2]
            input_base2 = input_path2.split("/")[-1].rsplit(".", 1)[0]
            csv_out1 = f"{input_base1}_birthdays_found_from_digits.csv"
            csv_out2 = f"{input_base2}_birthdays_found_from_digits.csv"
            results2 = find_birthdays_in_file(input_path2)
            write_birthday_csv(results1, csv_out1, prefix=f"{input_base1}_")
            write_birthday_csv(results2, csv_out2, prefix=f"{input_base2}_")
            # Write intersection
            csv_out_inter = f"{input_base1}_AND_{input_base2}_birthdays_intersection.csv"
            write_intersection_csv(
                results1, results2, csv_out_inter,
                prefix1=f"{input_base1}_", prefix2=f"{input_base2}_"
            )
        else:
            # Custom output filenames
            input_path2 = sys.argv[2]
            csv_out1 = sys.argv[3] if len(sys.argv) > 3 else f"{input_base1}_birthdays_found_from_digits.csv"
            csv_out2 = sys.argv[4] if len(sys.argv) > 4 else f"{input_path2.split('/')[-1].rsplit('.', 1)[0]}_birthdays_found_from_digits.csv"
            results2 = find_birthdays_in_file(input_path2)
            write_birthday_csv(results1, csv_out1, prefix=f"{input_base1}_")
            write_birthday_csv(results2, csv_out2, prefix=f"{input_path2.split('/')[-1].rsplit('.', 1)[0]}_")
            # Write intersection
            csv_out_inter = f"{input_base1}_AND_{input_path2.split('/')[-1].rsplit('.', 1)[0]}_birthdays_intersection.csv"
            write_intersection_csv(
                results1, results2, csv_out_inter,
                prefix1=f"{input_base1}_", prefix2=f"{input_path2.split('/')[-1].rsplit('.', 1)[0]}_"
            )