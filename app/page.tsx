'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StartupContext } from '@/lib/types'
import { MOCK_STARTUP } from '@/lib/mockData'

const EMPTY_FORM: StartupContext = {
  companyName: '',
  description: '',
  targetCustomer: '',
  problem: '',
  solution: '',
  whyNow: '',
  traction: '',
  businessModel: '',
  competitors: '',
  productUrl: '',
  repoUrl: '',
  founderVoiceSample: '',
}

export default function IntakePage() {
  const router = useRouter()
  const [form, setForm] = useState<StartupContext>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  function update(field: keyof StartupContext, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function loadSample() {
    setForm({
      companyName: MOCK_STARTUP.companyName,
      description: MOCK_STARTUP.description,
      targetCustomer: MOCK_STARTUP.targetCustomer,
      problem: MOCK_STARTUP.problem,
      solution: MOCK_STARTUP.solution,
      whyNow: MOCK_STARTUP.whyNow,
      traction: MOCK_STARTUP.traction,
      businessModel: MOCK_STARTUP.businessModel,
      competitors: MOCK_STARTUP.competitors,
      productUrl: '',
      repoUrl: '',
      founderVoiceSample: '',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const startup = await res.json()

      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId: startup.id }),
      })
      const session = await sessionRes.json()
      router.push(`/session/${session.id}`)
    } catch {
      router.push('/session/session_demo')
    }
  }

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="font-display text-amber text-sm tracking-widest mb-4">PITCHMIRROR</div>
          <h1 className="font-display text-6xl text-snow leading-none mb-4">
            YOUR DEMO DAY<br />
            <span className="text-amber">STARTS HERE</span>
          </h1>
          <p className="text-muted text-lg">
            Enter your startup context. We&apos;ll generate your pitch, build your investor room, and stress-test it live.
          </p>
          <button
            onClick={loadSample}
            className="mt-4 text-xs font-mono text-amber-dim border border-amber-dim/30 px-3 py-1.5 rounded hover:border-amber hover:text-amber transition-colors"
          >
            ↗ Load sample startup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="font-display text-2xl text-muted tracking-widest mb-5">01 — YOUR STARTUP</h2>
            <div className="space-y-4">
              <Field label="Company Name" required>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={e => update('companyName', e.target.value)}
                  placeholder="PitchMirror"
                  required
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors"
                />
              </Field>
              <Field label="One-line description" required>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="AI Demo Day simulator for founders"
                  required
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors"
                />
              </Field>
              <Field label="Target customer" required>
                <input
                  type="text"
                  value={form.targetCustomer}
                  onChange={e => update('targetCustomer', e.target.value)}
                  placeholder="Early-stage technical founders"
                  required
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors"
                />
              </Field>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display text-2xl text-muted tracking-widest mb-5">02 — THE PITCH</h2>
            <div className="space-y-4">
              <Field label="Problem" required>
                <textarea
                  value={form.problem}
                  onChange={e => update('problem', e.target.value)}
                  placeholder="Founders don't get enough high-quality pitch practice before Demo Day"
                  required
                  rows={2}
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors resize-none"
                />
              </Field>
              <Field label="Solution" required>
                <textarea
                  value={form.solution}
                  onChange={e => update('solution', e.target.value)}
                  placeholder="AI investor replicas simulate Demo Day with live questions and feedback"
                  required
                  rows={2}
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors resize-none"
                />
              </Field>
              <Field label="Why now" required>
                <textarea
                  value={form.whyNow}
                  onChange={e => update('whyNow', e.target.value)}
                  placeholder="AI avatars and marketing generation are now good enough to feel real"
                  required
                  rows={2}
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors resize-none"
                />
              </Field>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display text-2xl text-muted tracking-widest mb-5">03 — BUSINESS</h2>
            <div className="space-y-4">
              <Field label="Traction">
                <input
                  type="text"
                  value={form.traction}
                  onChange={e => update('traction', e.target.value)}
                  placeholder="100 beta users, $5k MRR, launched 3 weeks ago"
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors"
                />
              </Field>
              <Field label="Business model">
                <input
                  type="text"
                  value={form.businessModel}
                  onChange={e => update('businessModel', e.target.value)}
                  placeholder="SaaS, $49/simulation or $199/month"
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors"
                />
              </Field>
              <Field label="Competitors">
                <input
                  type="text"
                  value={form.competitors}
                  onChange={e => update('competitors', e.target.value)}
                  placeholder="Pitch deck tools, AI writing assistants"
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors"
                />
              </Field>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display text-2xl text-muted tracking-widest mb-2">04 — OPTIONAL CONTEXT</h2>
            <p className="text-dim text-sm font-mono mb-5">Paste these to generate a sharper pitch</p>
            <div className="space-y-4">
              <Field label="Product URL">
                <input
                  type="url"
                  value={form.productUrl}
                  onChange={e => update('productUrl', e.target.value)}
                  placeholder="https://yourproduct.com"
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors"
                />
              </Field>
              <Field label="GitHub repo URL">
                <input
                  type="url"
                  value={form.repoUrl}
                  onChange={e => update('repoUrl', e.target.value)}
                  placeholder="https://github.com/you/repo"
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors"
                />
              </Field>
              <Field label="Founder voice sample">
                <textarea
                  value={form.founderVoiceSample}
                  onChange={e => update('founderVoiceSample', e.target.value)}
                  placeholder="Paste a few sentences you've written — a tweet, a blog post, a Slack message — so the pitch sounds like you"
                  rows={3}
                  className="w-full bg-surface border border-border rounded px-4 py-3 text-snow placeholder:text-dim focus:border-amber transition-colors resize-none"
                />
              </Field>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber text-void font-display text-2xl tracking-widest py-5 rounded hover:bg-amber-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'GENERATING YOUR PITCH ROOM...' : 'GENERATE DEMO DAY ROOM →'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted uppercase tracking-widest mb-2">
        {label} {required && <span className="text-amber">*</span>}
      </label>
      {children}
    </div>
  )
}
