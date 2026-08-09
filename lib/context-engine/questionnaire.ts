import { ManualContext, QuestionnaireInput } from "./types";

/**
 * Questionnaire Adapter
 * 
 * Converts raw QA project wizard inputs into a normalized ManualContext.
 * Preserves all questionnaire parameters without duplicating or altering state.
 */
export function extractQuestionnaireContext(input: QuestionnaireInput): ManualContext {
  return {
    projectName: input.projectName?.trim() || "Untitled Project",
    productType: input.productType?.trim() || "Web App",
    domain: input.domain?.trim() || "Software Service",
    description: input.description?.trim() || "",
    websiteUrl: input.websiteUrl?.trim() || undefined,
    qaDepth: input.qaDepth || "balanced",
    qualityPriorities: input.qualityPriorities ? [...input.qualityPriorities] : [],
    automationPreferences: input.automationPrefs ? [...input.automationPrefs] : [],
    humanReviewCategories: input.humanReviewCats ? [...input.humanReviewCats] : [],
    additionalInstructions: input.additionalInstructions?.trim() || undefined,
    extractedAt: new Date().toISOString(),
  };
}
