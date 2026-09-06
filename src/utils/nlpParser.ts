export interface ParsedTaskMeta {
  cleanTitle: string
  dateStr?: string
  priority?: 'focus' | 'normal' | 'later'
  tags: string[]
  assignee?: string
}

export function parseNaturalLanguageTask(rawText: string): ParsedTaskMeta {
  let text = rawText

  // 1. Detect Priority
  let priority: 'focus' | 'normal' | 'later' | undefined = undefined
  if (/!high|urgent|critical|asap|high priority/i.test(text)) {
    priority = 'focus'
    text = text.replace(/!high|urgent|critical|asap|high priority/gi, '')
  } else if (/!low|later|someday|low priority/i.test(text)) {
    priority = 'later'
    text = text.replace(/!low|later|someday|low priority/gi, '')
  } else if (/!med|normal/i.test(text)) {
    priority = 'normal'
    text = text.replace(/!med|normal/gi, '')
  }

  // 2. Detect Tags
  const tags: string[] = []
  const hashMatches = text.match(/#(\w+)/g)
  if (hashMatches) {
    hashMatches.forEach(tag => {
      tags.push(tag.replace('#', ''))
    })
    text = text.replace(/#\w+/g, '')
  }

  if (tags.length === 0) {
    if (/design|figma|token|spec|ui|swiftui|glass/i.test(rawText)) {
      tags.push('Design', 'Systems')
    } else if (/work|sync|meeting|pitch|deck|standup/i.test(rawText)) {
      tags.push('Work', 'Sprint')
    }
  }

  // 3. Detect Assignee
  let assignee: string | undefined = undefined
  const withMatch = text.match(/\bwith\s+([A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+)?)/i)
  if (withMatch) {
    assignee = withMatch[1]
  }

  // 4. Detect Date / Time
  let dateStr: string | undefined = undefined
  if (/tomorrow\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i.test(rawText)) {
    const timeMatch = rawText.match(/tomorrow\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
    dateStr = `Tomorrow, ${timeMatch?.[1] || '9:00 AM'}`
  } else if (/tomorrow/i.test(rawText)) {
    dateStr = 'Tomorrow, 9:00 AM'
  } else if (/today\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i.test(rawText)) {
    const timeMatch = rawText.match(/today\s*(?:at\s*)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
    dateStr = `Today, ${timeMatch?.[1] || '5:00 PM'}`
  } else if (/this weekend/i.test(rawText)) {
    dateStr = 'This Weekend'
  } else if (/monday/i.test(rawText)) {
    dateStr = 'Next Monday, 10:00 AM'
  }

  const cleanTitle = text.replace(/\s+/g, ' ').trim() || rawText.trim()

  return {
    cleanTitle,
    dateStr,
    priority,
    tags,
    assignee,
  }
}
