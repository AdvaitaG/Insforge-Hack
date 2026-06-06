import * as insforgeStore from "./insforgeStore.mjs";
import * as jsonStore from "./jsonStore.mjs";

const useLocalOnly = process.env.USE_LOCAL_STORE === "true";
const useInsForge = !useLocalOnly && (await insforgeStore.isInsForgeConfigured());

if (useInsForge) {
  console.log("[store] Using InsForge database");
} else {
  console.log("[store] Using local JSON database");
}

export const createStartup = useInsForge
  ? insforgeStore.createStartup
  : jsonStore.createStartup;
export const getStartup = useInsForge ? insforgeStore.getStartup : jsonStore.getStartup;
export const createSession = useInsForge
  ? insforgeStore.createSession
  : jsonStore.createSession;
export const updateSession = useInsForge
  ? insforgeStore.updateSession
  : jsonStore.updateSession;
export const getSession = useInsForge ? insforgeStore.getSession : jsonStore.getSession;
export const addQuestions = useInsForge
  ? insforgeStore.addQuestions
  : jsonStore.addQuestions;
export const updateQuestionAnswer = useInsForge
  ? insforgeStore.updateQuestionAnswer
  : jsonStore.updateQuestionAnswer;
export const addLaunchAssets = useInsForge
  ? insforgeStore.addLaunchAssets
  : jsonStore.addLaunchAssets;
export const addAvatars = useInsForge ? insforgeStore.addAvatars : jsonStore.addAvatars;
