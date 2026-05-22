# ANSWERS.md
---
1. How to Run
Live URL:  https://farmanali108.github.io/Habit-Tracker/

To run locally on a fresh machine:

```
git clone https://github.com/FarmanAli108/Habit-Tracker.git
```

Then open `index.html` in any browser. No installs, no build tools, no dependencies.

---

 2. Stack & Design Choices

Stack: Vanilla HTML, CSS, and JavaScript — three separate files. No framework, no build step. I chose this because the task is a self-contained UI with no backend, and vanilla JS is the fastest way to ship something that just works in a browser without setup overhead.

Visual decision 1 — Sticky habit name column:
The habit name column stays fixed on the left while the day columns scroll horizontally. On mobile a 7-day grid doesn't fit on screen, so without this the user loses track of which row they're checking. The name column acts as a visual anchor — you always know which habit you're ticking.

Visual decision 2 — Today column highlighted in purple:
Today's column gets a distinct border and background tint so the user's eye lands on it immediately. The whole point of a daily habit tracker is "did I do this today" — making today visually louder than other days means the user never has to hunt for where they are in the week.

---

 3. Responsive & Accessibility

360px phone: The sidebar collapses behind a hamburger menu. The habit name column shrinks to 110px. The grid scrolls horizontally so all 7 days remain accessible. Habit actions (edit/delete) are always visible on mobile since there is no hover state on touch screens.

1440px laptop: The sidebar is always visible. The grid expands to fill the full width. Checkboxes are larger and more comfortable to click.

Accessibility handled: All interactive checkboxes have `aria-label` attributes including the habit name and date, and `aria-pressed` state so screen readers can announce checked/unchecked status. Keyboard users can tab through the grid.

Accessibility skipped: Focus ring styling is not customized — it falls back to the browser default. With more time I would add a visible custom focus outline that matches the app's color scheme, since the default is inconsistent across browsers.

## 4. AI Usage

I used Claude (claude.ai) throughout this project.

Where I used it:
- Initial app scaffold — full HTML/CSS/JS structure with grid layout and localStorage logic
- Date bug fix — `toISOString()` was returning UTC dates, showing the wrong day in UTC+5 (Pakistan timezone). Claude identified the bug and rewrote `toDateStr()` using `getFullYear/getMonth/getDate` to use local time instead
- Mobile responsive CSS — initial media queries for 360px viewport
- Sticky column z-index layering — fixing the overlap between the habit name column and day headers

What I changed:

The AI initially hid the edit and delete buttons with `opacity: 0` and only showed them on hover. On mobile, hover doesn't exist — so those buttons were completely invisible and users had no way to edit or delete habits. I changed this to `opacity: 1` always on mobile, and also gave the buttons a visible bordered style so they look like actual buttons rather than floating icons. The interaction model on touch is fundamentally different from desktop and the AI's default assumption was desktop-only.

---
 5. Honest Gap

The habit name column overlaps the day columns when scrolling horizontally on mobile. When you swipe right to see earlier days,
the sticky name column sits on top of the day header row incorrectly — 
the z-index layering between the sticky-left column and sticky-top header isn't fully resolved across 
all mobile browsers. With another day I would replace the CSS sticky approach with a proper fixed-layout table using 
`position: sticky` on both `thead th` and the first `td` of each row, tested across Chrome, Safari, and Firefox mobile, since sticky behavior in nested scroll containers is inconsistent and needs explicit overflow and transform handling per browser.
