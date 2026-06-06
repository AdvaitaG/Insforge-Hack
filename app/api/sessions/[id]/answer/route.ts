import { NextRequest, NextResponse } from 'next/server'
import { evaluateAnswer } from '@/adapters/memoir'

// ADVAITA: persist the answer to investor_questions table after evaluation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { questionId, answer, context, pitch, investorType, question } = await req.json()

  // ESHWAR: evaluateAnswer will be implemented in adapters/memoir.ts
  const evaluation = await evaluateAnswer({
    context,
    pitch,
    investorType,
    question,
    answer,
  }).catch(() => ({
    score: 7,
    feedback: 'Solid answer. Add more specificity.',
    strongerAnswer: answer,
  }))

  // TODO: update investor_questions row with answer + feedback + score

  return NextResponse.json({ questionId, ...evaluation })
}
