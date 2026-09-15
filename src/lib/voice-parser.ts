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
  const raw = (transcript || "").trim();
  const lower = raw.toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  // 1. Organization Detection
  let organization = "Galactic 3D";
  if (/\b(cambridge|cit|institute|college|class|lecture|exam|student|students|faculty|campus|academic|syllabus|curriculum|lab)\b/i.test(lower)) {
    organization = "Cambridge Institute of Technology";
  } else if (/\b(galactic|electric\s*3d|galaxy|g3d|3d|blender|three\s*js|webgl|unity|render|cad|aerospace|bass|model)\b/i.test(lower)) {
    organization = "Galactic 3D";
  }

  // 2. Category Detection
  let category = "Development";
  if (/\b(meet|meeting|meetings|call|sync|discussion|standup|client|huddle|interview|touchpoint|project review|coordination meeting|review meeting)\b/i.test(lower)) {
    category = "Meeting";
  } else if (/\b(design|figma|\bui\b|\bux\b|mockup|wireframe|layout|css|styling|theme|assets|shader|texture)\b/i.test(lower)) {
    category = "Design";
  } else if (/\b(research|study|survey|explore|investigate|benchmark|paper|reading|feasibility)\b/i.test(lower)) {
    category = "Research";
  } else if (/\b(test|testing|qa|verify|validation|cypress|jest|audit)\b/i.test(lower)) {
    category = "Testing";
  } else if (/\b(doc|documentation|docs|readme|writeup|guide|manual|report|specification)\b/i.test(lower)) {
    category = "Documentation";
  } else {
    category = "Development";
  }

  // 3. Priority Detection
  let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  if (/\b(urgent|critical|high priority|asap|important|blocker|crucial|p0|p1|deadline)\b/i.test(lower)) {
    priority = "HIGH";
  } else if (/\b(low priority|minor|trivial|optional|whenever|p3|p4)\b/i.test(lower)) {
    priority = "LOW";
  }

  // 4. Status Detection (work summaries of attended/completed tasks must be COMPLETED)
  let status: "COMPLETED" | "IN_PROGRESS" | "PENDING" = "COMPLETED";
  if (/^\s*(todo|to do|upcoming|scheduled|planned|next up|will do)\b/i.test(raw) ||
      (/\b(to be done|pending implementation|yet to start)\b/i.test(lower) && !/\b(participated|attended|completed|worked on|reviewed|conducted|built|finished|discussed)\b/i.test(lower))) {
    status = "PENDING";
  } else if (/\b(currently working on|still in progress|wip|work in progress|ongoing|halfway done)\b/i.test(lower) &&
             !/\b(participated in|attended|completed|finished|wrapped up)\b/i.test(lower)) {
    status = "IN_PROGRESS";
  } else {
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

  // Break text into sentences for contextual extraction
  const rawSentences = raw
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  // 6. Notes / Blockers / Action Items: Automatically extract follow-ups, action items, or impediments
  let notes = "";
  const blockerMatch = raw.match(/\b(?:blockers?|hurdles?|issues? faced|impediments?|challenges?|stuck on|problem was|blocked by)[:\-–]\s*([^\n.]+)/i);
  if (blockerMatch) {
    notes = blockerMatch[1].trim();
  } else {
    // Look for explicit action items or follow-ups first
    let actionSentence = rawSentences.find((s) =>
      /\b(action items?|follow-up|follow up|assigned action|assigned to stakeholders|deliverables documented|documented for execution|tasks were documented)\b/i.test(s)
    );
    if (!actionSentence) {
      actionSentence = rawSentences.find((s) =>
        /\b(pending activities|pending tasks|pending|blocker|hurdle|issue|problem|stuck|dependency)\b/i.test(s)
      );
    }
    if (actionSentence) {
      notes = actionSentence.replace(/^[-,•*\s]+/, "").trim();
    } else if (category === "Meeting") {
      notes = "Documented action items and milestone status for team follow-up.";
    } else if (category === "Development") {
      notes = "Verified code deliverables, ran checks, and scheduled next review.";
    } else if (category === "Design") {
      notes = "Asset specifications documented and shared for implementation.";
    } else {
      notes = "Milestones tracked and deliverables documented for next sprint.";
    }
  }

  // 7. Learnings / Key Insights: Automatically extract roadmap, evaluation, decisions, or takeaways
  let learnings = "";
  const learningMatch = raw.match(/\b(?:learnings?|key insights?|takeaways?|learned that|main takeaway)[:\-–]\s*([^\n.]+)/i);
  if (learningMatch) {
    learnings = learningMatch[1].trim();
  } else {
    // Score candidate sentences for strategic learning / roadmap / takeaway
    const candidateSentences = rawSentences.filter((s) => s !== notes);
    let bestInsight = "";
    let maxScore = 0;

    for (const s of candidateSentences) {
      let score = 0;
      if (/\b(roadmap|next phase)\b/i.test(s)) score += 4;
      if (/\b(evaluated|established|concluded|decision)\b/i.test(s)) score += 3;
      if (/\b(learned|insight|insights|takeaway|takeaways|findings|agreed|aligned)\b/i.test(s)) score += 3;
      if (/\b(optimized|analyzed|identified)\b/i.test(s)) score += 1;
      if (score > maxScore) {
        maxScore = score;
        bestInsight = s;
      }
    }

    if (bestInsight && maxScore > 0) {
      learnings = bestInsight.replace(/^[-,•*\s]+/, "").trim();
    } else if (category === "Meeting") {
      learnings = "Synchronized team roadmap and established key stakeholder deliverables.";
    } else if (category === "Development") {
      learnings = "Enhanced technical implementation stability and refined architectural flow.";
    } else if (category === "Design") {
      learnings = "Optimized design system consistency and user workflow efficiency.";
    } else {
      learnings = "Gained deeper clarity on project requirements and execution priorities.";
    }
  }

  // 8. Tags: Extract strict word-bounded tags
  const detectedTags: string[] = [];
  if (/\b(bass aerospace|aerospace)\b/i.test(lower)) detectedTags.push("Bass Aerospace");
  if (/\b(order tracking|tracking orders)\b/i.test(lower)) detectedTags.push("Order Tracking");
  if (/\b(meeting|meetings|standup|sync|huddle)\b/i.test(lower)) detectedTags.push("Meeting");
  if (/\b(project review|review)\b/i.test(lower)) detectedTags.push("Project Review");
  if (/\b(coordination|stakeholders)\b/i.test(lower)) detectedTags.push("Coordination");
  if (/\b(cambridge|student|students|exam|class|lecture)\b/i.test(lower)) detectedTags.push("Cambridge");
  if (/\b(galactic|3d model|3d rendering)\b/i.test(lower)) detectedTags.push("Galactic 3D");

  const commonTechRegexes: [RegExp, string][] = [
    [/\breact\b/i, "React"],
    [/\bnext\.?js\b/i, "Next.js"],
    [/\btypescript\b/i, "TypeScript"],
    [/\bjavascript\b/i, "JavaScript"],
    [/\btailwind\b/i, "Tailwind CSS"],
    [/\bthree\.?js\b/i, "Three.js"],
    [/\bwebgl\b/i, "WebGL"],
    [/\bblender\b/i, "Blender"],
    [/\bpython\b/i, "Python"],
    [/\bapi\b/i, "API"],
    [/\bauth(?:entication)?\b/i, "Auth"],
    [/\bdocker\b/i, "Docker"],
    [/\bnode\.?js\b|\bnodejs\b/i, "Node.js"],
    [/\bjwt\b/i, "JWT"],
    [/\bsql\b/i, "SQL"],
    [/\bmongodb\b/i, "MongoDB"],
    [/\bprisma\b/i, "Prisma"],
    [/\bgit\b/i, "Git"],
    [/\bfigma\b/i, "Figma"],
    [/\bui\b/i, "UI"],
    [/\bux\b/i, "UX"],
    [/\brefactor\b/i, "Refactoring"],
    [/\bbug(?:fix)?\b/i, "Bug Fix"],
  ];

  commonTechRegexes.forEach(([reg, label]) => {
    if (reg.test(lower)) detectedTags.push(label);
  });
  const tags = Array.from(new Set(detectedTags)).join(", ");

  // 9. Intelligent, Human-Grade Title Generation
  let title = "";

  // A. Check for explicit title / subject prefixes
  const explicitTitleMatch = raw.match(/^(?:title|task|subject|meeting|activity|deliverable)[:\-–]\s*([^\n]+)/i);
  if (explicitTitleMatch && explicitTitleMatch[1].trim().length > 3) {
    title = explicitTitleMatch[1].trim();
  } else if (/bass\s*aerospace/i.test(lower) && /order/i.test(lower)) {
    title = "Meeting with Bass Aerospace & Order Tracking";
  } else if (/bass\s*aerospace/i.test(lower)) {
    title = "Meeting with Bass Aerospace";
  } else {
    // B. Extract the first sentence / clause
    const firstLine = raw.split(/[\n.!?]/)[0].trim();

    // Strip leading conversational and action verbs
    let cleaned = firstLine
      .replace(/^(participated in (the|a)?|participated (the|a)?|attended (the|a)?|conducted (the|a)?|worked on (the|a)?|working on (the|a)?|built (the|a)?|created (the|a)?|developed (the|a)?|fixed (the|a)?|resolved (the|a)?|implemented (the|a)?|reviewed (the|a)?|completed (the|a)?|joined (the|a)?|held (the|a)?|spent time on (the|a)?|today i (was|worked|did|participated in|attended)?|i was working on|we had (the|a)?|had (the|a)?)\s+/i, "")
      .replace(/^(electric\s*3d|galactic\s*3d|cambridge)\s*(was there today|today|there today)?\s*(so was|so i was|i was|was)?\s*/i, "")
      .replace(/\s+(from|between)\s+\d+.*$/i, "")
      .trim();

    // Strip audience / context tails (e.g. "with the development team and stakeholders", "to discuss XYZ")
    const preAudience = cleaned.replace(/\s+\b(with|for|regarding|about|to discuss|in order to|aimed at|where we|as part of|across)\b.*$/i, "").trim();
    if (preAudience.length >= 8) {
      cleaned = preAudience;
    }

    // Strip trailing conjunctions/prepositions (e.g., "and", "or", "with", "the", "for")
    cleaned = cleaned.replace(/\s+\b(and|or|the|with|for|in|at|to|of|a|an)\s*$/i, "").trim();

    // Format & Title Case
    if (cleaned.length >= 5) {
      // Normalize 'and' to '&' for cleaner titles
      const normalized = cleaned.replace(/\s+and\s+/gi, " & ");
      title = normalized
        .split(" ")
        .map((w) => {
          if (w === "&") return "&";
          return w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
        })
        .join(" ");
    } else {
      title = `${category} - ${organization.split(" ")[0]}`;
    }
  }

  // Ensure title is concise and doesn't end abruptly
  if (title.length > 65) {
    const words = title.split(" ");
    let shortTitle = "";
    for (const w of words) {
      if ((shortTitle + " " + w).trim().length <= 60) {
        shortTitle = (shortTitle + " " + w).trim();
      } else {
        break;
      }
    }
    title = shortTitle || title.substring(0, 60);
    title = title.replace(/\s+\b(and|or|the|with|for|in|at|to|of|a|an|&)\s*$/i, "").trim();
  }

  return {
    organization,
    title,
    description: raw || "Completed work deliverables.",
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
