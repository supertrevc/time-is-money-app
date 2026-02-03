
// 1. Create the Master Sheet
export const UserContext = createContext();

// 2. Wrap the App (The "Provider")
function App() {
  const [realWage, setRealWage] = useState(0); // The value

  return (
    <UserContext.Provider value={{ realWage, setRealWage }}>
      
### Template
// You don't "run" this file, you just use it as a template/reference.

// 1. The User Profile Structure
export const UserProfileModel = {
  id: "user_123",
  financials: {
    netMonthlyIncome: 0,
    monthlyContractHours: 0,
    monthlyFixedCosts: 0,
    calculatedRealWage: 0 // We calculate and save this here
  },
  hiddenCosts: {
    dailyRoundTripMiles: 0,
    monthlyCommuteHours: 0,
    monthlyGroomingHours: 0,
    lunchCost: 0,
    wardrobeCost: 0
  },
  preferences: {
    theme: "dark", // "dark" or "light"
    currency: "USD"
  }
};

// 2. The Expense Transaction Structure
export const ExpenseModel = {
  id: "exp_999",
  title: "Netflix",
  amountDollars: 15.00,
  costInTime: { 
    hours: 0, 
    minutes: 30 
  },
  category: "routine", // 'baseline', 'routine', 'capex', 'unplanned'
  timestamp: Date.now()
};

### Onboarding Flow

#### Screen 1: The Hard Numbers (Income)
- Goal: Establish the baseline denominator.
- Question 1: "What is your Net Pay (Take-home)?"
- UI: Number Input (Large text)
- Helper Text: "Check your bank deposit, not your offer letter."

- Question 2: "How often are you paid?"
- UI: Segmented Control (Toggle)
- [Weekly] | [Bi-Weekly] | [Monthly]

- Question 3: "How many hours a week are you contracted for?"
- UI: Stepper Input
- Default: 40
- Step: +/- 5

JS Logic:
- Convert everything to a Monthly standard (x4.33 weeks/month).
- netMonthlyIncome = (Weekly Pay * 4.33) OR (Bi-Weekly * 2.165).

#### Screen 2: The Time Tax (Commute & Grooming)
Goal: Calculate hidden hours without making the user do math.

- Question 4: "Where do you work?" (The Zip Code Trick)
- UI: Two Inputs
- Input A: Home Zip Code
- Input B: Work Zip Code
- The Magic: Call a simple distance API (or use straight-line math) to get miles.
- Validation: Show the result to the user: "That looks like ~15 miles round-trip. Is that right?" [Yes/Edit]
    * JS Logic:
        * dailyCommuteMinutes = (RoundTripMiles * AvgSpeedFactor). Assume 30mph avg for city (2 mins per mile).
        * monthlyCommuteHours = (dailyCommuteMinutes / 60) * 21.67 work days.

- Question 5: "The Saturday Test" (Grooming)
- UI: A Slider with dynamic labels.
    * Prompt: "Think about getting ready. How much longer does it take you to leave the house on a Workday vs. a Saturday?"
    * Range: 0 mins to 90 mins.
    * Labels:
        * 0m: "I roll out of bed"
        * 20m: "Iron shirt / Makeup"
        * 60m+: "Full Suit / Perfection"
    * JS Logic:
        * monthlyGroomingHours = (SliderValue / 60) * 21.67 work days.

#### Screen 3: The "Work Overhead" (Expenses)
- Goal: Calculate money lost to the job using "Smart Defaults."
- Question 6: "Lunch Routine" (The Multiplier)
    * UI: Two-part interaction.
        * Toggle: [I Pack Lunch] (Cost $0) vs [I Buy Lunch]
        * If Buy: Slider for "Times per week" (1 to 5).
    * Cost: Button Select [$10] [$15] [$20]
    * JS Logic:
        * lunchCost = (Frequency * Cost) * 4.33.
- Question 7: "Work Wardrobe" (T-Shirt Sizing)
    * UI: Selectable Cards (Archetypes). Don't ask for receipts.
    * JS Logic:
        * wardrobeCost = Value of selected card.
        * Option A,"The Startup HoodieJeans, Tees, Sneakers. Low maintenance.",$15/mo (Laundry/Wear)
        * Option B,"Business CasualPolos, Blouses, Chinos. Occasional new items.",$50/mo
        * Option C,"The ""Suits"" LifeDry cleaning, Tailoring, Expensive shoes.",$120/mo

#### Screen 4: The Essentials (Fixed Costs)
- Goal: Capture non-negotiable monthly spending to calculate "Indentured Time".
- Question 8: "What keeps the lights on?"
- UI: Simple sum input or 3 quick fields.
    * Rent/Mortgage
    * Utilities/Internet
    * Insurance/Loan Minimums
- JS Logic:
    * monthlyFixedCosts = Sum of inputs.

### Final Calculation
- Once onboarding is completed, use this exact function to update the master file:
```js
function calculateFinalRealWage(data) {
  
  // 1. SUM OF MONTHLY INCOME
  const totalMoneyIn = data.financials.netMonthlyIncome;

  // 2. SUM OF MONTHLY COSTS (The Hidden Costs)
  const totalMoneyOut = 
      data.hiddenCosts.lunchCost + 
      data.hiddenCosts.wardrobeCost +
      // Add a standard "Commute Cost" (IRS rate approx $0.67/mile * miles * days)
      (data.hiddenCosts.dailyRoundTripMiles * 21.67 * 0.67); 

  // 3. SUM OF MONTHLY HOURS (Contract + Hidden)
  const totalHoursInvested = 
      data.financials.monthlyContractHours + 
      data.hiddenCosts.monthlyCommuteHours + 
      data.hiddenCosts.monthlyGroomingHours;

  // 4. THE FORMULA
  // (Money In - Money Out) / Time In
  const realWage = (totalMoneyIn - totalMoneyOut) / totalHoursInvested;

  return realWage.toFixed(2); // Returns format like "24.50"
}
```
### The Logic
- Using the information from the Onboarding questions, calculate the **Real Wage**.
- The **Real Wage** is the amount of time you have to spend on things that matter.
- Use the real wage to update the master file, which all other elements of the website will be connected to. **EVERYTHING SHOULD DYNAMICALLY UPDATE BASED ON THE REAL WAGE.**

### Errors and Edge Cases
- If the user enters a negative number, display an error message.
- If the user enters a number that is too large, display an error message.
- If the user enters a number that is too small, display an error message.
- If the user enters a number that is not a number, display an error message.
#### UI Tips for Smooth Onboarding
- One Question Per Screen: Do not put a giant form on one page. Mobile users hate scrolling. Use a "Wizard" style (Next -> Next -> Finish).
- Instant Feedback: As they answer questions, show a small "Estimated Wage" counter in the corner updating in real-time. It gamifies the survey.
- "I Don't Know" Button: If they get stuck on Zip Code, have a button that says "Skip (Use Average)" which defaults to 30 minutes. Never let them hit a wall.

## Dashboard
- at the top of the dashboard is the Life-Price Converter (LPC)
- above that is an introductory text that says "Anti-Budget Terminal v2.0" [in a futuristic font]

### Life-Price Converter (LPC)
- The **Life-Price Converter (LPC)** is the primary input mechanism of the Anti-Budget app. It serves two functions:
    1.  **Calculator:** Instantly translating a monetary input (USD) into a temporal output (Life Hours).
    2.  **Gatekeeper:** Forcing a psychological pause ("Gut Check") before a transaction is committed to the ledger.

### UI Layout & Structure
- The component is a vertical stack containing three distinct states.

#### State A: Idle / Input (Default)
- **Visual Container:** A stark, high-contrast rectangular terminal box with a subtle glowing border (Color: `Electric Blue` or `Amber`).
- **Elements:**
    * **Currency Prefix:** A static `$` symbol (Opacity: 50%).
    * **Input Field:** Large, monospace text cursor (e.g., `JetBrains Mono`, size 48sp).
    * **Real-Time Subtitle:** As the user types, a small text label below the input updates instantly.
        * *Format:* `≈ 0 HOURS, 0 MINUTES`
- As the user inputs numbers, the subtitle updates in real-time to reflect the estimated time cost.
    * *example:* Interaction Flow (Step-by-Step)
        1. Focus: User taps the terminal box. Keyboard opens (Numeric only).
        2. Typing:
            * User types 1. Subtitle shows ≈ 2 mins.
            * User types 2. Subtitle shows ≈ 29 mins.
            * User types 0. Subtitle shows ≈ 4 hrs 53 mins.

#### State B: Calculation / Result (Triggered on 'Enter')
- **Transition:** The Input Field slides up slightly. The "Real-Time Subtitle" morphs into the **Primary Display**.
- **Primary Display:** Massive, glowing text showing the final time calculation.
    * *Example:* `4 HOURS, 12 MINUTES`
- **Context Label:** Small text below the result: `BASED ON REAL WAGE: $24.50/HR`
    * *Example:* 
    3. Submit: User presses "Done" or "Enter" on keyboard.
    4. Morph: The numerical dollar amount ($120) dims (opacity 30%). The Time Amount (4 HRS 53 MIN) glows and enlarges (scale 1.5x).


### State C: The "Gut Check" Modal (Overlay)
- **Trigger:** Occurs immediately after State B is rendered.
- **UI:** A confirmation dialog or inline prompt that blocks the user from saving immediately.
- **Text:** `IS THIS WORTH [TIME_RESULT] OF FREEDOM?`
- **Actions:**
    * `[YES]`: Commits expense to Ledger → Animation: Time subtracts from "Freedom Bar."
    * `[NO]`: Clears input → Animation: Text dissolves/glitches out.
    *example:* 
    5. If YES: The Time Amount "flies" down into the Freedom Bar (Hero Animation).
    6. If NO: The screen shakes slightly (Haptic Feedback) and resets.

### Edge cases and error handling
- Zero Wage: If userRealWage is 0 or null, display prompt: "SETUP REQUIRED: CALCULATE WAGE FIRST".
- Massive Input: If user types a number that exceeds monthly hours (e.g., $100,000 car), the Output should switch units from HOURS to YEARS or MONTHS.
- Logic: If hours > 720 (30 days), convert display format.

### Dynamic Variables & Logic

#### Core Variables
These variables must be fetched from the user's `ProfileProvider` or global state before the widget builds.

| Variable Name | Type | Source | Description |
| :--- | :--- | :--- | :--- |
| `userRealWage` | `double` | Calculated during Onboarding | The user's effective hourly rate (Net Income - Costs / Total Hours). |
function calculateLifeCost(price, hourlyWage) {
  // 1. Guard clause: prevent division by zero
  if (!hourlyWage || hourlyWage === 0) {
    return { hours: 0, minutes: 0 };
  }

  // 2. The Math
  const totalHours = price / hourlyWage;
  
  // Math.floor() removes the decimal to get full hours
  const hours = Math.floor(totalHours); 
  
  // We take the remainder decimals and multiply by 60 to get minutes
  const minutes = Math.round((totalHours - hours) * 60);

  // 3. Return a clean object (JSON style)
  return { 
    hours: hours, 
    minutes: minutes 
  };
}

# Component Spec: Dashboard Widgets

## 1. The Freedom Bar (The Health Monitor)
*Visualizes how much of the user's month is already "sold" to bills versus how much they own.*

### Visual Structure
A horizontal progress bar divided into two (or three) segments.
* **Segment A (Dark Grey):** "Indentured Time" (Work hours required to pay Fixed Costs + Actual Work Hours).
* **Segment B (Neon Blue):** "Freedom Time" (The hours remaining for the user to live).
* **Segment C (Red - Optional):** "Deficit" (If they have overspent).

### Logic & Variables
You need to calculate `committedHours` vs `totalAwakeHours`.

#### UI 
* UI Interaction
* Hover State: When mouse hovers over the Grey bar, show tooltip: "You work 120 hours just to pay rent."

# Component Spec: The Routine Ticker (The Leak Tracker)
## Data Structure   
## Visual Structure
* Visual Structure
* Format: A list of "Pills" or "Cards" that scroll horizontally or stack vertically.
* Text: Display the Time, not the money.
* COFFEE: -4 HRS/MO
* NETFLIX: -30 MIN/MO
* Action: Clicking a pill allows you to "Edit Frequency" (e.g., change from 5x a week to 3x a week) and instantly see the Time Cost drop.

# Component Spec: The Overtime Bank (The Crisis Manager)
## Logic
// JS Logic Snippet
let overtimeDebt = 0;

// When user adds a $200 flat tire:
const expenseHours = 200 / user.realWage; // 8.1 Hours
overtimeDebt += expenseHours;

// Visual Output
const daysToWorkOff = overtimeDebt / 8; // "1.1 Work Days"
## Visual Structure
* Condition: Hidden if overtimeDebt == 0.
* Appearance: A red warning box pulsing slowly.
* Text: WARNING: UNPLANNED DEFICIT
* Subtext: You effectively need to work 1.1 extra days to pay for this.
* Button: [Clear Debt] (Allows user to assign a "Windfall" or savings transfer to wipe it).

# Component Spec: The Transaction Ledger (The History)
* A simple chronological list, but styled differently.

## Visual Structure
* Instead of a standard spreadsheet look, use a "Timeline" look.
* Left Column: The Item Name.
* Right Column: The Time Cost (Colored based on severity).
* < 1 Hour: Green/White
* 1 - 5 Hours: Yellow
* 5+ Hours: Red

## Logic
// Example Row Data
{
  date: "Oct 12",
  item: "Concert Tickets",
  cost: "$150.00",
  display: "6 HOURS 15 MIN" // The app calculates and shows this
}

# Design System: The Anti-Budget Terminal (v2.0)

## 1. Aesthetic Philosophy
**"The Time Terminal"**
* **Vibe:** Industrial Sci-Fi, Data-First, High Contrast.
* **Inspiration:** *In Time* (Movie), classic Unix terminals, Swiss minimalist watch faces.
* **Core Rule:** "Money is boring data (Grey/White). Time is life (Glowing Color)."

---

## 2. Color Palette
We use a "Dark Mode Only" strategy to save battery and reduce eye strain.

### Backgrounds (The Canvas)
* **`--bg-deep`**: `#0D0D0D` (Primary Background - Deep Charcoal/Near Black)
* **`--bg-surface`**: `#1A1A1A` (Card/Container Background)
* **`--bg-overlay`**: `#262626` (Modals/Dropdowns)

### Text & Data
* **`--text-primary`**: `#FFFFFF` (Headings, Primary Values)
* **`--text-secondary`**: `#A1A1AA` (Labels, Subtitles - Muted Grey)
* **`--text-muted`**: `#52525B` (Placeholder text, inactive icons)

### Functional Accents (The Meaning)
* **`--accent-time`**: `#FFBF00` (Amber/Gold) - **Used for TIME values.**
    * *Meaning:* Time is precious currency.
* **`--accent-freedom`**: `#00E5FF` (Cyan/Electric Blue) - **Used for FREEDOM BAR.**
    * *Meaning:* The goal; open space.
* **`--accent-danger`**: `#FF4444` (Desaturated Red) - **Used for DEFICIT/WARNINGS.**
    * *Meaning:* You are losing time.
* **`--accent-success`**: `#10B981` (Emerald) - **Used for SAVINGS/WINDFALLS.**

### The "Glow" Variables (CSS Shadows)
* **`--glow-time`**: `0 0 10px rgba(255, 191, 0, 0.6)`
* **`--glow-freedom`**: `0 0 15px rgba(0, 229, 255, 0.5)`
* **`--glow-danger`**: `0 0 10px rgba(255, 68, 68, 0.4)`

---

## 3. Typography
**Font Family:** `JetBrains Mono`, `Roboto Mono`, or `Fira Code`.
**Rule:** Strict Monospace for ALL numbers and data. Sans-serif (like Inter) is *only* allowed for long-form help text (optional).

### Hierarchy
* **H1 (The Result):** Size `48px` | Weight `700` | Tracking `-1.5px`
    * *Usage:* The "4 HOURS" result display.
* **H2 (Section Headers):** Size `18px` | Weight `500` | Uppercase | Tracking `2px`
    * *Usage:* "FREEDOM BAR", "ROUTINE TICKER".
* **Body (Input):** Size `32px` | Weight `400`
    * *Usage:* The Dollar Amount input field.
* **Label (Meta):** Size `12px` | Weight `400` | Uppercase
    * *Usage:* "Based on Real Wage", "Gut Check".

---

## 4. UI Components & Shapes

### A. The "Terminal Container" (Cards)
Every distinct section (Ticker, Bar, Converter) lives in a container that looks like a hardware interface.
* **Border:** `1px solid #333333`
* **Border Radius:** `8px` (Slightly rounded, not pill-shaped).
* **Padding:** `24px`
* **Corner Detail:** Optional: Add small "brackets" or "rivets" in the corners using SVG background images to sell the sci-fi look.

### B. The "Life-Price" Input Field
* **State: Idle**
    * Background: Transparent
    * Border: `1px solid #52525B`
    * Text: White
* **State: Focus (Active)**
    * Border: `1px solid --accent-freedom`
    * Box-Shadow: `--glow-freedom`
    * Text: White
* **State: Processing (Calculated)**
    * Border: `1px solid --accent-time`
    * Box-Shadow: `--glow-time`
    * Text: `--accent-time`

### C. The Buttons
Avoid "Solid Blocks" of color. Use "Outline" styles to keep it minimal.
* **Primary Action (Submit/Confirm):**
    * Background: `rgba(0, 229, 255, 0.1)` (10% Opacity Blue)
    * Border: `1px solid --accent-freedom`
    * Text: `--accent-freedom`
    * *Hover:* Background becomes 100% Opacity Blue, Text becomes Black.
* **Destructive Action (Cancel/No):**
    * Text: `--accent-danger`
    * *Hover:* Text glows Red.

---

## 5. Animations & Micro-interactions
This is what makes the app feel "premium" rather than just a spreadsheet.

### A. The "Number Scramble" (Decoding Effect)
When the Life-Price Converter changes from Dollars to Hours, do not just swap the text.
* **Effect:** The numbers should rapidly cycle through random characters (`$120` -> `X%#@` -> `4 HRS`) for 300ms.
* **Why:** It reinforces the idea that the app is "decoding" the matrix of money to show you the truth.

### B. The "Freedom Bar" Fill
* **Transition:** `width 1.5s cubic-bezier(0.22, 1, 0.36, 1)`
* **Effect:** When the bar loads, it shouldn't just appear. It should "shoot" from left to right, perhaps overshooting slightly and bouncing back (elastic effect).

### C. The "Gut Check" Pulse
* **Animation:** `pulse 2s infinite`
* **Keyframes:**
    * 0%: Opacity 1
    * 50%: Opacity 0.5
    * 100%: Opacity 1
* **Usage:** The text *"Is this worth 4 hours?"* should breathe slowly to create a moment of pause.

---

## 6. Layout Spacing (The Grid)
Use a strict **8px Grid System**.
* **Margins:** `16px` (Mobile), `32px` (Desktop).
* **Gaps:**
    * Between Cards: `24px`
    * Between Header & Content: `40px`
    * Inside Cards: `16px`

---

## 7. Responsive Breakpoints

### Mobile (Default)
* **Stack:** Vertical Column.
* **Order:**
    1.  Life-Price Converter (Top)
    2.  Freedom Bar
    3.  Routine Ticker (Collapsed to summary view)
* **Font Sizes:** H1 scales down to `36px` to fit narrow screens.

### Desktop / Tablet (> 768px)
* **Grid:** 2-Column or Dashboard Layout.
    * **Left Col:** Life-Price Converter + Freedom Bar.
    * **Right Col:** Routine Ticker + Recent Transactions List.
* **Visuals:** Add subtle background "circuit line" SVG patterns (opacity 5%) to fill the empty black space.
