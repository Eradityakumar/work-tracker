# WorkTrail AI 🚀
### AI-Powered Employee Personal Work Tracker & Reporting Platform

A modern, production-ready web platform that combines the best of **Notion, Clockify, Jira Worklog, and an AI productivity assistant**.

---

## 🌟 Key Features

1. **Authentication & Roles**
   - Secure email/password authentication with JWT sessions.
   - User profiles with Department, Designation, and Role (`EMPLOYEE` and `ADMIN`).
   - Instant 1-click demo login buttons for both Employee and Admin.

2. **Executive Dashboard**
   - Tasks completed today
   - Total hours worked today
   - Files uploaded today
   - Weekly productivity score
   - Recent activity feed
   - Upcoming / In-progress tasks

3. **Daily Work Log Module**
   - Create, edit, and filter tasks with Title, Description, Category, Start/End times, Priority, Status, Notes, Learnings, Tags, and Evidence.
   - Real-time duration computation with cross-midnight support.
   - Card view and dense Table view toggles.

4. **Visual Day Timeline**
   - Chronological vertical day schedule (e.g. `09:00 AM – Standup`, `10:00 AM – Research`).
   - Dynamic date navigation (prev day, next day, today).

5. **Calendar View**
   - Monthly, Weekly, and Daily calendar views.
   - Activity density indicators and day inspection side panel.

6. **File Evidence Vault & AI OCR Analyzer**
   - Drag-and-drop file upload supporting Screenshots, Images, PDFs, Word, Excel, and ZIP archives.
   - Automatic OCR text extraction and AI summary generation.
   - Intelligent auto-categorization suggestion.
   - File preview modal and direct downloads.

7. **Personal Work Journal & Notes**
   - Daily reflections editor with private/shared toggle.
   - Continuous technical learnings tracker.
   - Future action items checklist.

8. **AI Reporting Engine & Export**
   - Daily Work Summary, Weekly Progress Report, and Monthly Performance Review.
   - Single-click export to **PDF** (via jsPDF) and **Excel** (via XLSX).
   - Powered by OpenAI `gpt-4o` with built-in heuristic fallback engine for 100% offline testability.

9. **Analytics & Productivity Velocity**
   - Hours worked per day bar charts.
   - Velocity trend lines.
   - Category distribution pie chart.
   - Task completion rate breakdown.

10. **AI Work Pattern Insights**
    - Prime execution window / peak productivity hours.
    - Deep work vs meeting overhead ratio.
    - Focus score index (0-100).
    - Strategic recommendations.

11. **Admin & Engineering Management Dashboard**
    - Multi-employee roster with hours, completion rates, and efficiency ratings.
    - Filter by department.
    - Employee dossier inspection with individual reports and work logs.

12. **Global Workspace Search**
    - Universal search (`⌘K`) across task titles, descriptions, notes, tags, and files.

---

## ⚡ Quick Start

### 1. Credentials (Pre-seeded)
- **Employee**: `employee@worktrail.ai` / `password123`
- **Admin**: `admin@worktrail.ai` / `password123`

### 2. Run Locally
```bash
# Install dependencies
npm install

# Push database schema & seed demo records
npx prisma db push
node prisma/seed.js

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, next-themes (Dark & Light Mode)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: MongoDB Atlas with Prisma ORM
- **Authentication**: JWT session tokens with `jose` and `bcryptjs`
- **AI**: OpenAI API (`gpt-4o`) with heuristic local fallback
- **Exports**: `jspdf`, `jspdf-autotable`, `xlsx`
# work-tracker
