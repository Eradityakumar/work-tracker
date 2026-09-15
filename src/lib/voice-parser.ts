export interface ParsedVoiceWorkLog {
  organization: string;
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  notes: string;
  learnings: string;
  tags: string;
}

export function parseVoiceLocally(transcript: string): ParsedVoiceWorkLog {
  const text = (transcript || "").trim();
  const lower = text.toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  // 1. Organization
  let organization = "Galactic 3D";
  if (/cambridge|cit|institute|college|class|lecture|exam|student|faculty|campus|academic/i.test(lower)) {
    organization = "Cambridge Institute of Technology";
  } else if (/galactic|3d|g3d|blender|three\s*js|webgl|unity|render|model/i.test(lower)) {
    organization = "Galactic 3D";
  }

  // 2. Category
  let category = "Development";
  if (/\b(design|figma|ui|ux|mockup|wireframe|layout|css|styling|theme|assets)\b/i.test(lower)) {
    category = "Design";
  } else if (/\b(research|study|survey|explore|investigate|benchmark|paper|reading)\b/i.test(lower)) {
    category = "Research";
  } else if (/\b(meet|meeting|call|sync|discussion|standup|client|huddle|interview)\b/i.test(lower)) {
    category = "Meeting";
  } else if (/\b(test|testing|qa|verify|validation|cypress|jest|audit)\b/i.test(lower)) {
    category = "Testing";
  } else if (/\b(doc|documentation|docs|readme|writeup|guide|manual|report)\b/i.test(lower)) {
    category = "Documentation";
  } else if (/\b(code|build|api|develop|feature|backend|frontend|react|node|database|fix|bug|refactor)\b/i.test(lower)) {
    category = "Development";
  }

  // 3. Priority
  let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  if (/\b(urgent|critical|high priority|asap|important|blocker|crucial|p0|p1)\b/i.test(lower)) {
    priority = "HIGH";
  } else if (/\b(low priority|minor|trivial|optional|whenever|p3|p4)\b/i.test(lower)) {
    priority = "LOW";
  }

  // 4. Status
  let status: "COMPLETED" | "IN_PROGRESS" | "PENDING" = "COMPLETED";
  if (/\b(in progress|working on|still doing|started|underway|ongoing|halfway)\b/i.test(lower)) {
    status = "IN_PROGRESS";
  } else if (/\b(pending|todo|to do|will do|scheduled|planned|next)\b/i.test(lower)) {
    status = "PENDING";
  }

  // 5. Time extraction (e.g. "from 9 to 11", "10am to 12pm", "10 to 1")
  let startTime = "09:00";
  let endTime = "11:00";
  const timeRangeMatch = lower.match(/(?:from\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-|until)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

  if (timeRangeMatch) {
    let sH = parseInt(timeRangeMatch[1], 10);
    const sM = timeRangeMatch[2] ? parseInt(timeRangeMatch[2], 10) : 0;
    const sMeridiem = timeRangeMatch[3]?.toLowerCase();

    let eH = parseInt(timeRangeMatch[4], 10);
    const eM = timeRangeMatch[5] ? parseInt(timeRangeMatch[5], 10) : 0;
    const eMeridiem = timeRangeMatch[6]?.toLowerCase();

    if (sMeridiem === "pm" && sH < 12) sH += 12;
    if (eMeridiem === "pm" && eH < 12) eH += 12;
    if (!eMeridiem && !sMeridiem) {
      if (eH < sH) eH += 12;
      else if (sH < 7) sH += 12;
      if (eH < 7) eH += 12;
    }

    startTime = `${String(sH).padStart(2, "0")}:${String(sM).padStart(2, "0")}`;
    endTime = `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`;
  }

  // 6. Notes / Blockers Extraction
  let notes = "";
  const notesMatch = text.match(/(?:notes?|blockers?|issues?|hurdles?|stuck on|problem was|fixed bug|resolved)[:\s]+([^.]+)/i);
  if (notesMatch) {
    notes = notesMatch[1].trim();
  }

  // 7. Learnings / Insights Extraction
  let learnings = "";
  const learningsMatch = text.match(/(?:learnings?|insights?|takeaways?|learned that|learned about|understood)[:\s]+([^.]+)/i);
  if (learningsMatch) {
    learnings = learningsMatch[1].trim();
  }

  // 8. Tags Extraction
  const commonTech = [
    "react", "nextjs", "typescript", "javascript", "tailwind", "css", "mongodb",
    "prisma", "threejs", "webgl", "blender", "python", "api", "auth", "docker",
    "node", "jwt", "sql", "git", "figma", "ui", "ux", "redux"
  ];
  const detectedTags = commonTech.filter((t) => lower.includes(t));
  const tags = detectedTags.join(", ");

  // 9. Title & Description
  let title = "";
  const firstSentence = text.split(/[.!?\n]/)[0].trim();
  const cleanTitle = firstSentence
    .replace(/^(i worked on|i built|i did|worked on|working on|today i|spent time on|for galactic 3d|for cambridge)\s+/i, "")
    .replace(/\s+(from|between)\s+\d+.*$/i, "");

  if (cleanTitle.length > 4 && cleanTitle.length < 75) {
    title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  } else {
    title = `${category} Deliverables - ${organization.split(" ")[0]}`;
  }

  return {
    organization,
    title,
    description: text || "Completed work deliverables.",
    category,
    date: today,
    startTime,
    endTime,
    priority,
    status,
    notes,
    learnings,
    tags,
  };
}
