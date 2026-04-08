# 🌲 Nature Series Wall Calendar

A premium, interactive wall calendar component built with React and Next.js. Designed to bridge the gap between physical aesthetics and digital utility, this calendar features dynamic "Nature Collection" themes, intuitive range selection, and tactile micro-interactions.

![Calendar Theme: Cedar Grove](https://via.placeholder.com/800x400.png?text=Nature+Series+Wall+Calendar) 

## ✨ Key Features

- **Dynamic Theming Engine:** Switch between four curated nature themes (Cedar Grove, Deep Tide, Desert Clay, Midnight Peak). All UI selection states and active colors map dynamically to the chosen theme.
- **Frictionless Navigation:** - **Quick-Select Mini-map:** Click the Month/Year title to reveal a smooth overlay for instantly jumping to any month.
  - **Keyboard Accessibility:** Use the `ArrowLeft` and `ArrowRight` keys to quickly flip through the calendar.
- **Smart Range Selection:** Click to set a start and end date. The UI automatically highlights the range and unlocks a contextual "Event Details" journaling section.
- **Persistent Storage:** Monthly goals and range-specific notes are automatically saved to `localStorage`.
- **Holiday Awareness:** Major holidays are visually marked with colored dots; hover over them to see the holiday name.
- **Premium Animations:** Powered by Framer Motion, featuring spring-based hover states and smooth layout transitions.

---

## 🛠️ Technical & Design Choices

When architecting this component, several specific choices were made to ensure it felt like a "Pro" level product:

1. **Hydration Safety (Next.js):**
   Because the calendar initializes with `new Date()`, there is an inherent risk of React hydration mismatches between the server and the client (especially across timezones). A `[mounted, setMounted]` shield was implemented to ensure the UI only renders once the client assumes control.
2. **Functional State Updates:**
   To prevent "stale closures" (where rapidly typing a note might result in lost keystrokes because the state hasn't caught up), the `updateData` function utilizes React's functional state update pattern (`prev => {...}`).
3. **Derived State Optimization:**
   Instead of recalculating the active month's data on every keystroke or render, `useMemo` is used to cache `currentMonthData` based strictly on the active `storageKey`.
4. **Tailwind as a Theme API:**
   Instead of hardcoding colors in the JSX, the `THEMES` array passes specific Tailwind classes (`activeBg`, `rangeBg`, `textActive`) into the component, making it incredibly easy to add new themes in the future without touching the core grid logic.

---

## 🚀 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
If you haven't already, clone the project to your local machine:
```bash
git clone https://github.com/svjadhav2010-hub/nature-wall-calendar.git
cd nature-wall-calendar
````

### 2\. Install Dependencies

This project relies on a few key libraries (`framer-motion`, `lucide-react`). Install them via npm:

```bash
npm install
```

### 3\. Start the Development Server

Run the Next.js development server:

```bash
npm run dev
```

### 4\. View the Application

Open your browser and navigate to:
[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

-----

## 📁 File Structure

  - `/app/components/WallCalendar.tsx` - The core, self-contained interactive calendar component.
  - `/app/page.tsx` - The main Next.js page that imports and renders the calendar.

## 🤝 Contributing

Feel free to open issues or submit pull requests if you want to add new themes, animations, or features\!

```
