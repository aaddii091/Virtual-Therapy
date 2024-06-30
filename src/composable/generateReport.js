import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const report = async (input, userInfo) => {
  const prompt = `
  Based on the following chat, generate a therapy session report in JSON format with the following structure:
  {
    "clientInformation": {
      "name": "",
      "dateOfBirth": "",
      "sessionDateAndTime": ""
    },
    "therapistInformation": {
      "name": "",
      "credentialsAndLicenseNumber": ""
    },
    "presentingProblem": {
      "reasonForSeekingTherapy": "",
      "currentIssuesAndSymptoms": ""
    },
    "backgroundInformation": {
      "relevantMedicalAndPsychologicalHistory": "",
      "previousTherapyOrTreatment": ""
    },
    "sessionSummary": {
      "mainTopicsDiscussed": "",
      "clientsMoodAndBehaviorDuringSession": "",
      "keyInsightsAndObservations": ""
    },
    "interventionsUsed": {
      "techniquesOrApproachesUsed": "",
      "specificExercisesOrActivities": ""
    },
    "clientsResponse": {
      "clientsReactionToInterventions": "",
      "progressMadeOrChallengesFaced": ""
    },
    "therapeuticGoals": {
      "shortTermGoals": "",
      "longTermGoals": "",
      "modificationsToExistingGoals": ""
    }
  }
  Respond only with JSON formatted as described above.

  
  Here are the chat logs -
  ${input.map(chat => `${chat.role}: ${chat.content}`).join("\n")}
  `;


 // ${userInfo.name} is the client name ,${userInfo.age} age and ${userInfo.gender} is the gender and below are the chat logs 

  const completion = await openai.chat.completions.create({
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
  });

  const fullResponse = completion.choices[0].message.content;
  
//   Parse the JSON response
  let reportJson;
  try {
    reportJson = JSON.parse(fullResponse);
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    reportJson = null;
  }

  return reportJson;
}

const generateReport = () => {
  return {
    report
  }
}

export default generateReport;
