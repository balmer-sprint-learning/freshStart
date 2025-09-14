# FreshStart License Generation Formula

## License Format
The license follows this format: `NICKNAME-SUM-UNIX4-TIER-DEFAULT-DEFAULT`

## License Formula Breakdown

### Part 1: NICKNAME
- User's 2-character nickname (uppercase)
- Example: `BB`

### Part 2: SUM 
- Sum of: (last 2 digits of year) + (month number) + (date in month)
- Example for September 14, 2025: `25 + 9 + 14 = 48`

### Part 3: UNIX4
- First 4 digits of current Unix timestamp
- Example: Unix time `1726317234` → `1726`

### Part 4: TIER
- Default value: `T1`

### Part 5: DEFAULT
- Default value: `7`
- Valid choices: `7`, `14`, `31`, `U`

### Part 6: FINAL
- Default value: `025`
- Valid choices: `015` to `099` (any number from 15 to 99, zero-padded to 3 digits)

## Complete License Example
For user "BB" on September 14, 2025 at Unix time 1726317234:
- Nickname: `BB`
- Sum: `25 + 9 + 14 = 48`
- Unix4: `1726`
- Tier: `T1`
- Default: `7`
- Final: `025`

**Result**: `BB-48-1726-T1-7-025`

---

# Prefix Generation Formula

## Prefix Format
The prefix follows this format: `NICKNAME-YYYYMM-UNIXTIME-RANDOM6`

## Prefix Formula Breakdown

### Part 1: NICKNAME
- User's 2-character nickname (uppercase)
- Example: `BB`

### Part 2: YYYYMM
- Year (2 digits) + Month (2 digits, zero-padded)
- Example for September 2025: `2509`

### Part 3: UNIXTIME
- Unix timestamp in seconds (not milliseconds)
- Example: `1726317234`

### Part 4: RANDOM6
- Cryptographically secure random 6-digit number
- Example: `847293`

## Complete Prefix Example
For user "BB" on September 14, 2025 at Unix time 1726317234:
- Nickname: `BB`
- YYYYMM: `2509`
- UnixTime: `1726317234`
- Random6: `847293`

**Result**: `BB-2509-1726317234-847293`

## Implementation
- License formula is implemented in the `calculateLicense()` function in `profile.js`
- Prefix formula is implemented in the `calculatePrefix()` function in `profile.js`
- Prefix generation is triggered by completion of the version field
