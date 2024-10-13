import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import "pdf-parse";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const getPineconeClient = () => {
  return new Pinecone({
    // environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export async function loadS3IntoPineCone(file_key: string) {
  // 1.Obtain the pdf -> download and read from pdf
  console.log("Downloading s3 into file system");
  const file_name = await downloadFromS3(file_key);

  if (!file_name) {
    throw new Error("could not download from S3");
  }

  const loader = new PDFLoader(file_name);
  const pages = await loader.load();
  return pages;
}
