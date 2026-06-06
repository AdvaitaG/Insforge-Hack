export function generateMockPitchPackage(context) {
  const company = context.companyName || "PitchMirror";
  const customer = context.targetCustomer || "early-stage founders";
  const problem =
    context.problem || "founders do not get enough high-quality pitch practice";
  const solution =
    context.solution || "AI investor replicas simulate Demo Day and rewrite the pitch";
  const whyNow =
    context.whyNow || "AI avatars and startup-specific marketing generation are now good enough";

  return {
    pitch:
      `${company} helps ${customer} pressure-test their startup pitch before they walk into the room. ` +
      `Today, ${problem}. Our product solves this by letting founders rehearse against AI investor replicas, ` +
      `get scored on clarity, market, defensibility, and go-to-market, then receive a sharper rewritten pitch and launch package. ` +
      `This matters now because ${whyNow}. We start with technical founders who already iterate quickly and need better narrative loops every week.`,
    oneLiner: `${company} is an AI Demo Day room for ${customer}.`,
    positioning:
      `${company} turns pitch practice from a static writing task into a live investor simulation with immediate promotional output.`,
    proofPoints: [
      "Live investor-style Q&A exposes weak assumptions faster than a static deck review.",
      "The same startup context generates both the pitch and the launch package.",
      "Founders can run repeated simulations as their product and market story change."
    ],
    risks: [
      "The product needs high-quality investor questions to feel credible.",
      "Avatar latency could weaken the live demo if there is no fallback.",
      "The first use case must be narrow enough to avoid generic pitch-coach territory."
    ],
    investorQuestions: [
      {
        investorType: "skeptical_partner",
        question: "Why is this a venture-scale company instead of a useful pitch-prep feature?"
      },
      {
        investorType: "technical_partner",
        question: "What gets better technically or strategically as more founders use the simulator?"
      },
      {
        investorType: "growth_partner",
        question: "Who is the first paying customer, and how do you reach the first 100 of them?"
      }
    ],
    launchAssets: [
      {
        assetType: "x_thread",
        content:
          `1/ We built ${company}: an AI Demo Day room where founders practice against investor replicas and leave with a sharper pitch.`
      },
      {
        assetType: "linkedin_post",
        content:
          `Founders practice pitches in front of mirrors. ${company} makes the mirror talk back like an investor panel.`
      },
      {
        assetType: "hacker_news_post",
        content:
          `Show HN: ${company} - AI investor replicas that pressure-test and rewrite startup pitches`
      },
      {
        assetType: "product_hunt_tagline",
        content: "Practice Demo Day with AI investor replicas"
      },
      {
        assetType: "demo_video_script",
        content:
          "Open with the founder entering a startup idea, generate the room, show the avatar pitch, answer one hard investor question, and reveal the improved pitch."
      }
    ]
  };
}

export function evaluateMockAnswer({ investorType, answer }) {
  const lengthScore = Math.min(4, Math.floor((answer || "").length / 45));
  const specificityBoost = /\d|customer|founder|weekly|paid|revenue|retention|distribution/i.test(answer || "")
    ? 2
    : 0;
  const score = Math.max(4, Math.min(10, 4 + lengthScore + specificityBoost));
  const label = investorType.replace("_", " ");

  return {
    score,
    feedback:
      score >= 8
        ? `Strong ${label} answer. It gives a concrete wedge and avoids vague founder-speak.`
        : `Useful start, but the ${label} answer needs more concrete evidence, customer specificity, and a sharper next step.`,
    strongerAnswer:
      "We start with technical founders shipping weekly because they repeatedly need pitch, launch, and investor narrative updates. The wedge is rehearsal before fundraising; the expansion is ongoing founder marketing and fundraising readiness."
  };
}

export function generateMockFinalReport({ context, answers }) {
  const answeredCount = answers.filter((item) => item.answer).length;
  const readinessScore = Math.min(88, 62 + answeredCount * 7);

  return {
    readinessScore,
    scoreBreakdown: {
      clarity: 8,
      urgency: 7,
      market: answeredCount >= 2 ? 8 : 6,
      differentiation: 8,
      gtm: answeredCount >= 3 ? 8 : 6,
      fundability: 7
    },
    strengths: [
      "The pitch has a clear live-demo hook.",
      "The product combines simulation, critique, and promotional output.",
      "The target user is easy to understand."
    ],
    weaknesses: [
      "Market sizing needs to be stated more directly.",
      "The moat should explain what improves with repeated usage.",
      "The first acquisition channel should be more concrete."
    ],
    rewrittenPitch:
      `${context.companyName} is an AI Demo Day room for early-stage founders. ` +
      "Instead of practicing alone or getting occasional feedback, founders pitch to AI investor replicas that challenge market size, technical depth, and go-to-market. " +
      "After each session, the product scores the pitch, rewrites the weak parts, and turns the same narrative into launch content. " +
      "We start with technical founders preparing for accelerators, demos, and fundraising because they ship quickly and constantly need clearer positioning.",
    launchAssets: [
      {
        assetType: "linkedin_post",
        content:
          `${context.companyName} lets founders rehearse Demo Day with AI investor replicas, then walks away with a rewritten pitch and launch package.`
      },
      {
        assetType: "product_hunt_description",
        content:
          "A live AI pitch room for founders: practice with investor replicas, get scored, rewrite your pitch, and generate launch assets."
      }
    ]
  };
}
