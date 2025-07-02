import sys
import time

def print_progress(i, n, start_time):
    percent = (i + 1) / n
    bar_len = 40
    filled_len = int(bar_len * percent)
    bar = '=' * filled_len + '-' * (bar_len - filled_len)
    elapsed = time.time() - start_time
    if percent > 0:
        est_total = elapsed / percent
        eta = est_total - elapsed
    else:
        eta = 0
    print(f"\r[{bar}] {percent*100:6.2f}%  ETA: {eta:8.1f}s", end='', flush=True, file=sys.stderr)

def gen_e_digits(n):
    # More efficient spigot algorithm for e (based on the formula e = 2 + 1/1! + 1/2! + 1/3! + ...)
    array_size = n + 10  # Add a buffer
    a = [1] * array_size
    
    yield "2"  # First digit
    yield "."  # Decimal point
    
    start_time = time.time()
    last_update = 0
    
    # Generate n digits after the decimal point
    for i in range(n):
        # Process current state to get next digit
        carry = 0
        for j in range(array_size - 1, 0, -1):
            temp = a[j] * 10 + carry
            a[j] = temp % (j + 1)
            carry = temp // (j + 1)
        
        yield str(carry)
        
        # Print progress every 0.5 seconds or on last iteration
        if i == n - 1 or time.time() - last_update > 0.5:
            print_progress(i, n, start_time)
            last_update = time.time()
    
    print(file=sys.stderr)  # Newline after progress bar

def main():
    if len(sys.argv) < 3:
        print("Usage: python gen_e_digits.py <N> <output_file>", file=sys.stderr)
        sys.exit(1)
    
    N = int(sys.argv[1])
    output_file = sys.argv[2]
    
    print(f"Generating {N} digits of e to {output_file}...", file=sys.stderr)
    
    with open(output_file, 'w') as f:
        # We're now yielding the full number including the "2"
        for d in gen_e_digits(N+1):  # +1 to include the leading 2
            f.write(d)
    
    print(f"Done! {N} digits of e written to {output_file}", file=sys.stderr)

if __name__ == "__main__":
    main()
