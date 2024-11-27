/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import "pdf-parse";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";

let pinecone: Pinecone | null = null;

const pineconeApi = process.env.NEXT_PUBLIC_PINECONE_API_KEY;

if (!pineconeApi) {
  throw new Error("Missing Pinecone API key");
}
export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: pineconeApi,
    });
  }
  console.log(pineconeApi);
  return pinecone;
};
type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};
export async function loadS3IntoPineCone(file_key: string) {
  // 1.Obtain the pdf -> download and read from pdf
  console.log("Downloading s3 into file system");
  const file_name = await downloadFromS3(file_key);

  if (!file_name) {
    throw new Error("could not download from S3");
  }
  try {
    // 1. Obtain the pdf -> download and read from pdf
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    // 2. Split and segment the pdf
    const documents = await Promise.all(
      pages.map((page) => prepareDocument(page))
    );

    // 3. Vectorise and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocuments));

    // 4. Upload to Pinecone
    const client = await getPineconeClient();
    const pineconeIndex = client.Index("chatpdf");

    console.log("inserting vectors into Pinecone");
    const namespace = convertToAscii(file_key);

    console.log({ pineconeIndex, vectors, namespace }, "pinecone");
    await chunkedUpsert(pineconeIndex, vectors, namespace, 10);

    console.log("upsert successfully");
    return documents[0];
  } catch (error) {
    console.log("Error in loading", error);
  }
}

async function embedDocuments(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    };
  } catch (error) {
    console.log("Error embedding document: ", error);
    throw error;
  }
}
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

// spliting the documents only upto 36000 bytes since pinecone db accepts upto that length only
async function prepareDocument(page: PDFPage) {
  // eslint-disable-next-line prefer-const
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, " ");

  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  return docs;
}

async function chunkedUpsert(

  pineconeIndex: any,
  vectors: any,
  namespace: string,
  chunkSize = 10
) {
  if (vectors.length <= 10) {
    await pineconeIndex.namespace(namespace).upsert([...vectors]);
    return;
  }

  const chunks = [];

  for (let i = 0; i < vectors.length; i += chunkSize) {
    chunks.push(vectors.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    await pineconeIndex.namespace(namespace).upsert(chunk);
  }

  return;
}
