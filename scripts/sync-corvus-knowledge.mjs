import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { GoogleGenAI } from "@google/genai";

const root = resolve(import.meta.dirname, "..");
const knowledgeDirectory = resolve(root, "knowledge");

async function readLocalEnvironment() {
  const environment = {};

  for (const filename of [".env.local", ".env"]) {
    try {
      const contents = await readFile(resolve(root, filename), "utf8");
      for (const line of contents.split(/\r?\n/u)) {
        const match = line.match(
          /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/u,
        );
        if (!match) continue;

        const [, key, rawValue] = match;
        const value = rawValue.replace(
          /^(?:"([\s\S]*)"|'([\s\S]*)')$/u,
          "$1$2",
        );
        if (!(key in environment)) environment[key] = value;
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  return environment;
}

async function waitForOperation(ai, operation) {
  let currentOperation = operation;

  while (!currentOperation.done) {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 2_500));
    currentOperation = await ai.operations.get({ operation: currentOperation });
  }

  if (currentOperation.error) {
    throw new Error(
      `Gemini indexing failed: ${JSON.stringify(currentOperation.error)}`,
    );
  }
}

async function main() {
  const localEnvironment = await readLocalEnvironment();
  const apiKey = process.env.GEMINI_API_KEY || localEnvironment.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env.local before synchronizing knowledge.",
    );
  }

  const files = (await readdir(knowledgeDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    throw new Error("No Markdown knowledge files were found in /knowledge.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const store = await ai.fileSearchStores.create({
    config: {
      displayName: `corvus-portfolio-${new Date().toISOString().slice(0, 10)}`,
      embeddingModel: "models/gemini-embedding-001",
    },
  });

  if (!store.name) {
    throw new Error(
      "Gemini created a File Search store without a resource name.",
    );
  }

  console.log(`Created ${store.name}`);

  for (const filename of files) {
    console.log(`Indexing ${filename}...`);
    const operation = await ai.fileSearchStores.uploadToFileSearchStore({
      file: resolve(knowledgeDirectory, filename),
      fileSearchStoreName: store.name,
      config: {
        displayName: filename,
        mimeType: "text/markdown",
      },
    });
    await waitForOperation(ai, operation);
  }

  console.log("\nKnowledge synchronization complete.");
  console.log("Add this server-side value to .env.local and Vercel:");
  console.log(`GEMINI_FILE_SEARCH_STORE=${store.name}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
