/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPineconeClient } from "./pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  const pinecone = await getPineconeClient();

  const index: any = pinecone.Index("learn-chatpdf");

  try {
    const namespace = convertToAscii(fileKey);
    const queryResult = await index.query({
      // topK returns top 5 similar vectors
      topK: 5,
      // vector is the query that we want to chekc against i.e the embedding
      vector: embeddings,
      includeMetadata: true,
      namespace,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.error("Error querying embeddings: ", error);
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match: any) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingDocs.map((match: any) => {
    return (match.metadata as Metadata).text;
  });

  // 5 vectors
  return docs.join("\n").substring(0, 3000);
}
