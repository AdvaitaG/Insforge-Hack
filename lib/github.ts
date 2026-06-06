import { StartupContext } from './types'

function extractSection(readme: string, keywords: string[]): string {
  const lines = readme.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(/^#{1,3}\s+(.+)$/i)
    if (heading && keywords.some((k) => heading[1].toLowerCase().includes(k))) {
      const content: string[] = []
      for (let j = i + 1; j < lines.length; j++) {
        if (/^#{1,3}\s+/.test(lines[j])) break
        const line = lines[j].trim()
        if (line && !line.startsWith('```') && !line.startsWith('![')) {
          content.push(line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))
        }
      }
      const text = content.join(' ').trim()
      if (text) return text.slice(0, 500)
    }
  }
  return ''
}

function firstParagraph(readme: string): string {
  const paragraphs = readme
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(
      (p) =>
        p &&
        !p.startsWith('#') &&
        !p.startsWith('```') &&
        !p.startsWith('![') &&
        !p.startsWith('|') &&
        !p.startsWith('---')
    )

  const text = (paragraphs[0] ?? '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()

  return text.slice(0, 500)
}

export function parseReadmeToStartup(readme: string, repo: string): StartupContext {
  const repoName = repo.split('/').pop() ?? repo
  const titleMatch = readme.match(/^#\s+(.+)$/m)
  const companyName =
    titleMatch?.[1]?.trim().replace(/[*_`]/g, '') ||
    repoName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const description = firstParagraph(readme) || `${companyName} — open source project on GitHub`
  const problem =
    extractSection(readme, ['problem', 'challenge', 'pain', 'issue']) || description
  const solution =
    extractSection(readme, ['solution', 'about', 'what is', 'overview', 'features']) ||
    description
  const targetCustomer =
    extractSection(readme, ['customer', 'audience', 'user', 'who']) ||
    'Developers and technical teams'
  const whyNow =
    extractSection(readme, ['why now', 'motivation', 'background']) ||
    'Open source momentum and growing developer adoption'

  return {
    companyName,
    description,
    targetCustomer,
    problem,
    solution,
    whyNow,
    traction: extractSection(readme, ['traction', 'stats', 'metrics', 'usage']) || '',
    businessModel: extractSection(readme, ['business', 'pricing', 'monetization']) || '',
    competitors: extractSection(readme, ['competitor', 'alternative', 'comparison']) || '',
    productUrl: '',
    repoUrl: `https://github.com/${repo}`,
    founderVoiceSample: '',
  }
}
