export interface ParsedTaskMeta {
  cleanTitle: string
  dateStr?: string
  hasExplicitDeadline: boolean
  priority: 'focus' | 'normal' | 'later'
  priorityLabel: 'High' | 'Medium' | 'Low'
  tags: string[]
  assignee?: string
  estimatedMinutes: number
  category: string
  suggestedDeadlines: { label: string; value: string; icon: string }[]
}

export interface AISubtask {
  id: string
  title: string
  done: boolean
}

/**
 * Strips speech recognition verbal filler words and normalizes spoken tags
 */
export function normalizeSpeechInput(rawText: string): string {
  let text = rawText

  // Convert spoken hashtags: "hashtag design" -> "#design", "hash work" -> "#work", "tag urgent" -> "#urgent"
  text = text.replace(/\b(?:hashtag|hash|tag)\s+([a-zA-Z0-9_-]+)/gi, '#$1')

  // Convert spoken priority shortcuts
  text = text.replace(/\b(?:priority\s*1|priority\s*one|p1)\b/gi, '!high')
  text = text.replace(/\b(?:priority\s*2|priority\s*two|p2)\b/gi, '!med')
  text = text.replace(/\b(?:priority\s*3|priority\s*three|p3)\b/gi, '!low')

  return text
}

/**
 * Strips filler words from title for clean executive task formatting
 */
export function cleanSpokenFillers(text: string): string {
  return text
    .replace(/\b(uh|um|er|ah|you know|so basically|like|i need to|i have to|i gotta|please remember to|don't forget to|remind me to|create a task to|add a task to|schedule a task to)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Format a Date object as "h:mm A"
 */
function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

/**
 * Dynamic suggested deadlines based on the current hour of the day
 */
export function getSmartSuggestedDeadlines(): { label: string; value: string; icon: string }[] {
  const now = new Date()
  const currentHour = now.getHours()

  const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000)

  const suggestions = [
    {
      label: '⚡ In 2 Hours',
      value: `Today, ${formatTime(inTwoHours)}`,
      icon: 'zap',
    },
  ]

  if (currentHour < 16) {
    suggestions.push({
      label: '🌅 Today 5:00 PM',
      value: `Today, 5:00 PM`,
      icon: 'sun',
    })
  }

  if (currentHour < 20) {
    suggestions.push({
      label: '🌙 Tonight 9:00 PM',
      value: `Today, 9:00 PM`,
      icon: 'moon',
    })
  }

  suggestions.push(
    {
      label: '☀️ Tomorrow 9 AM',
      value: `Tomorrow, 9:00 AM`,
      icon: 'calendar',
    },
    {
      label: '📅 Tomorrow 3 PM',
      value: `Tomorrow, 3:00 PM`,
      icon: 'clock',
    },
    {
      label: '🗓️ This Friday',
      value: 'This Friday, 5:00 PM',
      icon: 'calendar-days',
    },
    {
      label: '📌 Next Monday',
      value: 'Next Monday, 10:00 AM',
      icon: 'bookmark',
    }
  )

  return suggestions
}

/**
 * Natural language task parsing engine with multi-factor extraction
 */
export function parseNaturalLanguageTask(rawInput: string): ParsedTaskMeta {
  const normalized = normalizeSpeechInput(rawInput)
  let text = normalized

  // 1. Detect Priority
  let priority: 'focus' | 'normal' | 'later' = 'normal'
  let priorityLabel: 'High' | 'Medium' | 'Low' = 'Medium'

  if (/!high|\burgent\b|\bcritical\b|\basap\b|\bemergency\b|\bhigh priority\b|\bp1\b|\bimportant\b/i.test(text)) {
    priority = 'focus'
    priorityLabel = 'High'
    text = text.replace(/!high|\burgent\b|\bcritical\b|\basap\b|\bemergency\b|\bhigh priority\b|\bp1\b|\bimportant\b/gi, '')
  } else if (/!low|\blater\b|\bsomeday\b|\blow priority\b|\bp3\b|\bchill\b/i.test(text)) {
    priority = 'later'
    priorityLabel = 'Low'
    text = text.replace(/!low|\blater\b|\bsomeday\b|\blow priority\b|\bp3\b|\bchill\b/gi, '')
  } else if (/!med|\bnormal priority\b|\bmedium priority\b|\bp2\b/i.test(text)) {
    priority = 'normal'
    priorityLabel = 'Medium'
    text = text.replace(/!med|\bnormal priority\b|\bmedium priority\b|\bp2\b/gi, '')
  }

  // 2. Detect Tags / Hashtags
  const tags: string[] = []
  const hashMatches = text.match(/#([a-zA-Z0-9_-]+)/g)
  if (hashMatches) {
    hashMatches.forEach(tag => {
      const clean = tag.replace('#', '').trim()
      if (clean && !tags.includes(clean)) {
        tags.push(clean)
      }
    })
    text = text.replace(/#[a-zA-Z0-9_-]+/g, '')
  }

  // Auto-infer tags if none provided
  if (tags.length === 0) {
    if (/design|figma|token|spec|ui|swiftui|glass|icon|layout/i.test(normalized)) {
      tags.push('Design')
    } else if (/code|api|backend|frontend|bug|fix|deploy|repo|test|git/i.test(normalized)) {
      tags.push('Engineering')
    } else if (/meeting|sync|call|demo|client|pitch|deck|standup/i.test(normalized)) {
      tags.push('Work')
    } else if (/buy|grocery|personal|health|workout|gym|doctor|home/i.test(normalized)) {
      tags.push('Personal')
    }
  }

  // 3. Detect Assignee
  let assignee: string | undefined = undefined
  const withMatch = text.match(/\bwith\s+([A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+)?)/i)
  if (withMatch) {
    assignee = withMatch[1]
    text = text.replace(withMatch[0], '')
  }

  // 4. Detect Date & Time / Deadline
  let dateStr: string | undefined = undefined
  let hasExplicitDeadline = false

  // Relative hours / minutes: "in 2 hours", "in 45 minutes"
  const relHourMatch = text.match(/\bin\s+(\d+)\s*(?:hours|hour|hrs|hr)\b/i)
  const relMinMatch = text.match(/\bin\s+(\d+)\s*(?:minutes|minute|mins|min)\b/i)

  if (relHourMatch) {
    const hours = parseInt(relHourMatch[1], 10)
    const targetDate = new Date(Date.now() + hours * 3600 * 1000)
    dateStr = `Today, ${formatTime(targetDate)}`
    hasExplicitDeadline = true
    text = text.replace(relHourMatch[0], '')
  } else if (relMinMatch) {
    const mins = parseInt(relMinMatch[1], 10)
    const targetDate = new Date(Date.now() + mins * 60 * 1000)
    dateStr = `Today, ${formatTime(targetDate)}`
    hasExplicitDeadline = true
    text = text.replace(relMinMatch[0], '')
  } else if (/tomorrow\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i.test(text)) {
    const timeMatch = text.match(/tomorrow\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
    dateStr = `Tomorrow, ${timeMatch?.[1] || '9:00 AM'}`
    hasExplicitDeadline = true
    text = text.replace(/tomorrow\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/gi, '')
  } else if (/\btomorrow morning\b/i.test(text)) {
    dateStr = 'Tomorrow, 9:00 AM'
    hasExplicitDeadline = true
    text = text.replace(/\btomorrow morning\b/gi, '')
  } else if (/\btomorrow afternoon\b/i.test(text)) {
    dateStr = 'Tomorrow, 2:00 PM'
    hasExplicitDeadline = true
    text = text.replace(/\btomorrow afternoon\b/gi, '')
  } else if (/\btomorrow evening\b|\btomorrow night\b/i.test(text)) {
    dateStr = 'Tomorrow, 7:00 PM'
    hasExplicitDeadline = true
    text = text.replace(/\btomorrow evening\b|\btomorrow night\b/gi, '')
  } else if (/\btomorrow\b/i.test(text)) {
    dateStr = 'Tomorrow, 9:00 AM'
    hasExplicitDeadline = true
    text = text.replace(/\btomorrow\b/gi, '')
  } else if (/today\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i.test(text)) {
    const timeMatch = text.match(/today\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
    dateStr = `Today, ${timeMatch?.[1] || '5:00 PM'}`
    hasExplicitDeadline = true
    text = text.replace(/today\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/gi, '')
  } else if (/\b(?:at|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i.test(text)) {
    const timeMatch = text.match(/\b(?:at|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i)
    dateStr = `Today, ${timeMatch?.[1]}`
    hasExplicitDeadline = true
    text = text.replace(/\b(?:at|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/gi, '')
  } else if (/\btonight\b|\bthis evening\b/i.test(text)) {
    dateStr = 'Today, 8:30 PM'
    hasExplicitDeadline = true
    text = text.replace(/\btonight\b|\bthis evening\b/gi, '')
  } else if (/\bend of day\b|\beod\b/i.test(text)) {
    dateStr = 'Today, 5:00 PM'
    hasExplicitDeadline = true
    text = text.replace(/\bend of day\b|\beod\b/gi, '')
  } else if (/\bthis weekend\b/i.test(text)) {
    dateStr = 'This Weekend, 11:00 AM'
    hasExplicitDeadline = true
    text = text.replace(/\bthis weekend\b/gi, '')
  } else if (/\b(?:this\s+)?friday\b/i.test(text)) {
    dateStr = 'This Friday, 5:00 PM'
    hasExplicitDeadline = true
    text = text.replace(/\b(?:this\s+)?friday\b/gi, '')
  } else if (/\b(?:next\s+)?monday\b/i.test(text)) {
    dateStr = 'Next Monday, 10:00 AM'
    hasExplicitDeadline = true
    text = text.replace(/\b(?:next\s+)?monday\b/gi, '')
  }

  // 5. Clean Title (strips filler words and trims punctuation)
  let cleanTitle = cleanSpokenFillers(text)
  cleanTitle = cleanTitle.replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, '').trim()
  if (!cleanTitle && rawInput.trim()) {
    cleanTitle = rawInput.trim()
  }

  // Capitalize first character
  if (cleanTitle.length > 0) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
  }

  // 6. Category mapping
  let category = 'General Work'
  if (tags.some(t => /design|ui|ux|figma/i.test(t))) {
    category = 'Figma Design System'
  } else if (tags.some(t => /engineering|code|dev|bug/i.test(t))) {
    category = 'Engineering Sprint'
  } else if (tags.some(t => /personal|health|home/i.test(t))) {
    category = 'Personal Lifestyle'
  } else if (tags.some(t => /client|sales|deal/i.test(t))) {
    category = 'Client Engagement'
  }

  // 7. Estimate minutes
  let estimatedMinutes = 30
  const lower = cleanTitle.toLowerCase()
  if (/call|quick|ping|message|slack|email|reply|check|verify|approve/i.test(lower)) {
    estimatedMinutes = 15
  } else if (/review|write|update|document|prepare|meeting|sync|refine/i.test(lower)) {
    estimatedMinutes = 45
  } else if (/build|design|create|architect|implement|refactor|develop/i.test(lower)) {
    estimatedMinutes = 60
  }

  return {
    cleanTitle,
    dateStr,
    hasExplicitDeadline,
    priority,
    priorityLabel,
    tags,
    assignee,
    estimatedMinutes,
    category,
    suggestedDeadlines: getSmartSuggestedDeadlines(),
  }
}

/**
 * AI Action-Plan Generator: Generates 3-4 structured, tactical subtasks
 */
export function generateAISubtasks(taskTitle: string): AISubtask[] {
  const text = (taskTitle || '').toLowerCase()
  let subtaskTitles: string[] = []

  if (/design|figma|ui|ux|wireframe|token|mockup|prototype|liquid/i.test(text)) {
    subtaskTitles = [
      'Create high-fidelity Figma components & tokens',
      'Test Apple HIG 2026 Liquid Glass contrast & accessibility',
      'Export production vector assets & spec tokens',
    ]
  } else if (/code|api|backend|frontend|react|bug|fix|deploy|database|sheets|endpoint/i.test(text)) {
    subtaskTitles = [
      'Review architectural requirements & API contracts',
      'Implement core logic with error boundaries & logging',
      'Verify production build and run end-to-end verification',
    ]
  } else if (/presentation|deck|pitch|meeting|client|demo|shareholder|board/i.test(text)) {
    subtaskTitles = [
      'Structure executive summary & key talking points',
      'Assemble supporting metrics, charts, and live demo sandbox',
      'Conduct final dry run and distribute follow-up agenda',
    ]
  } else if (/review|pr|pull request|audit|test/i.test(text)) {
    subtaskTitles = [
      'Checkout branch and verify local builds pass',
      'Audit logic for edge cases, null guards, and security',
      'Submit constructive code review comments & approval',
    ]
  } else if (/write|doc|document|spec|post|article|blog|guide/i.test(text)) {
    subtaskTitles = [
      'Outline key topics and audience takeaways',
      'Draft core content with illustrative examples',
      'Proofread and publish with proper formatting',
    ]
  } else if (/workout|gym|health|doctor|buy|grocery|shop/i.test(text)) {
    subtaskTitles = [
      'Set target checklist & preparation items',
      'Execute primary session / purchase list',
      'Log metrics and celebrate completion',
    ]
  } else {
    // Default smart action breakdown
    subtaskTitles = [
      'Define clear success criteria & milestones',
      'Execute focused 25-minute deep work sprint',
      'Review final output and sync status',
    ]
  }

  return subtaskTitles.map((title, idx) => ({
    id: `ai-subtask-${Date.now()}-${idx}`,
    title,
    done: false,
  }))
}

