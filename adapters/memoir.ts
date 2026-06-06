import { FinalReport, InvestorType, PitchPackage, StartupContext } from '@/lib/types'
import { MOCK_FINAL_REPORT, MOCK_PITCH_PACKAGE } from '@/lib/mockData'

// ESHWAR: implement these three functions using the Memoir API (or Claude API fallback)

export async function generatePitchPackage(
  context: StartupContext
): Promise<PitchPackage> {
  // TODO: call Memoir API / Claude API with context, return structured PitchPackage
  return MOCK_PITCH_PACKAGE
}

export async function evaluateAnswer(input: {
  context: StartupContext
  pitch: string
  investorType: InvestorType
  question: string
  answer: string
}): Promise<{ score: number; feedback: string; strongerAnswer: string }> {
  // TODO: call Memoir API / Claude API, return score + feedback + stronger answer
  return {
    score: 7,
    feedback: 'Clear framing, but needs stronger evidence of repeated user pain.',
    strongerAnswer:
      'We target devtool founders because they launch every sprint — that is weekly recurring pain, not a one-time event.',
  }
}

export async function generateFinalReport(input: {
  context: StartupContext
  originalPitch: string
  answers: {
    investorType: string
    question: string
    answer: string
    feedback?: string
  }[]
}): Promise<FinalReport> {
  // TODO: call Memoir API / Claude API, return full FinalReport
  return MOCK_FINAL_REPORT
}
