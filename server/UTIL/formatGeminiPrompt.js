export function formatGeminiPrompt(conversationHistory, userMessage) {
    let prompt = "";
    if (conversationHistory && conversationHistory.length > 0) {
        for (const message of conversationHistory) {
            prompt += `${message.role}: ${message.content}\n`;
        }
    }
    prompt += `user: ${userMessage}\nassistant:`;
    return prompt;
}