import { id, now } from "../utils.mjs";

const personas = {
  founder: {
    displayName: "Founder",
    persona: "Confident technical founder presenting a crisp 60-second Demo Day pitch."
  },
  skeptical_partner: {
    displayName: "Skeptical Partner",
    persona: "Challenges market size, competition, urgency, and whether this can become a venture-scale company."
  },
  technical_partner: {
    displayName: "Technical Partner",
    persona: "Challenges product depth, defensibility, architecture, and whether this is more than a thin wrapper."
  },
  growth_partner: {
    displayName: "Growth Partner",
    persona: "Challenges first customer, distribution, pricing, retention, and repeat usage."
  }
};

export function createDefaultAvatars(sessionId) {
  return Object.entries(personas).map(([role, config]) => ({
    id: id("avatar"),
    sessionId,
    role,
    providerAvatarId: null,
    displayName: config.displayName,
    persona: config.persona,
    createdAt: now()
  }));
}
