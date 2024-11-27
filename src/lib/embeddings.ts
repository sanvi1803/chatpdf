import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  console.log(text, "text");

  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    const result = await response.json();

    console.log("result", result);
    return result.data[0].embedding as number[];
    // result.data[0].embedding is an array of numbers
  } catch (error) {
    console.log("Error calling OpenAI embeddings api: ", error);
    throw error;
  }
}
