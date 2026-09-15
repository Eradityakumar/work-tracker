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

  // 1. Organization Detection (handles speech recognition variants & typos like "electric 3D")
  let organization = "Galactic 3D";
  if (/cambridge|cit|institute|college|class|lecture|exam|student|faculty|campus|academic|syllabus|curriculum|lab/i.test(lower)) {
    organization = "Cambridge Institute of Technology";
  } else if (/galactic|electric\s*3d|galaxy|g3d|3d|blender|three\s*js|webgl|unity|render|cad|aerospace|bass|order|tracking/i.test(lower)) {
    organization = "Galactic 3D";
  }

  // 2. Category Detection
  let category = "Development";
  if (/\b(meet|meeting|meetings|call|sync|discussion|standup|client|huddle|interview|touchpoint|bass\s*aerospace)\b/i.test(lower)) {
    category = "Meeting";
  } else if (/\b(design|figma|ui|ux|mockup|wireframe|layout|css|styling|theme|assets|shader|texture)\b/i.test(lower)) {
    category = "Design";
  } else if (/\b(research|study|survey|explore|investigate|benchmark|paper|reading|feasibility)\b/i.test(lower)) {
    category = "Research";
  } else if (/\b(test|testing|qa|verify|validation|cypress|jest|audit)\b/i.test(lower)) {
    category = "Testing";
  } else if (/\b(doc|documentation|docs|readme|writeup|guide|manual|report|specification)\b/i.test(lower)) {
    category = "Documentation";
  } else if (/\b(code|build|api|develop|feature|backend|frontend|react|node|database|fix|bug|refactor|orders|tracking|browser)\b/i.test(lower)) {
    category = "Development";
  }

  // 3. Priority Detection
  let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  if (/\b(urgent|critical|high priority|asap|important|blocker|crucial|p0|p1|deadline)\b/i.test(lower)) {
    priority = "HIGH";
  } else if (/\b(low priority|minor|trivial|optional|whenever|p3|p4)\b/i.test(lower)) {
    priority = "LOW";
  }

  // 4. Status Detection
  let status: "COMPLETED" | "IN_PROGRESS" | "PENDING" = "COMPLETED";
  if (/\b(in progress|still doing|underway|halfway|currently working)\b/i.test(lower)) {
    status = "IN_PROGRESS";
  } else if (/\b(pending|todo|to do|will do|scheduled|planned|next)\b/i.test(lower)) {
    status = "PENDING";
  } else if (/\b(done|finished|completed|resolved|wrapped up|attended|shipped|fixed|was working on)\b/i.test(lower)) {
    status = "COMPLETED";
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
  const detectedTags: string[] = [];
  if (/bass\s*aerospace|aerospace/i.test(lower)) detectedTags.push("Bass Aerospace");
  if (/orders?|tracking/i.test(lower)) detectedTags.push("Order Tracking");
  if (/meeting|call|sync/i.test(lower)) detectedTags.push("Meeting");
  if (/browser/i.test(lower)) detectedTags.push("Browser Integration");
  if (/cambridge|student|exam|class/i.test(lower)) detectedTags.push("Cambridge");
  if (/galactic|3d/i.test(lower)) detectedTags.push("Galactic 3D");

  const commonTech = [
    "react", "nextjs", "typescript", "javascript", "tailwind", "css", "mongodb",
    "prisma", "threejs", "webgl", "blender", "python", "api", "auth", "docker",
    "node", "jwt", "sql", "git", "figma", "ui", "ux", "redux"
  ];
  commonTech.forEach((t) => {
    if (lower.includes(t)) detectedTags.push(t.toUpperCase());
  });
  const tags = Array.from(new Set(detectedTags)).join(", ");

  // 9. Intelligent Title Generation
  let title = "";

  // Check specific high-signal cues first
  if (/bass\s*aerospace/i.test(lower) && /order/i.test(lower)) {
    title = "Meeting with Bass Aerospace & Order Tracking";
  } else if (/bass\s*aerospace/i.test(lower)) {
    title = "Meeting with Bass Aerospace";
  } else {
    // Strip common speech/typing prefixes
    let clean = text
      .replace(/^(electric\s*3d|galactic\s*3d|cambridge)\s*(was there today|today|there today)?\s*(so was|so i was|i was|was)?\s*/i, "")
      .replace(/^(today\s*i\s*(was|worked|built|did|spent time on)|working on|worked on|i was working on|i did|spent time on|handled)\s+/i, "")
      .replace(/\s+(from|between)\s+\d+.*$/i, "")
      .trim();

    // Clean conversational filler words
    clean = clean.replace(/\b(and also like|also like|like figureing out|figureing out|figuring out)\b/gi, "& review");

    // Take the first clean clause or line
    const firstLine = clean.split(/[\n.]/)[0].trim();
    if (firstLine.length >= 5 && firstLine.length <= 80) {
      // Capitalize first letter of words
      title = firstLine
        .split(" ")
        .map((w) => w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w)
        .join(" ");
    } else if (clean.length >= 5) {
      const words = clean.split(" ").slice(0, 7).join(" ");
      title = words.charAt(0).toUpperCase() + words.slice(1);
    } else {
      title = `${category} Task - ${organization.split(" ")[0]}`;
    }
  }

  // Ensure title length is concise & clean
  if (title.length > 70) {
    title = title.substring(0, 67) + "...";
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
