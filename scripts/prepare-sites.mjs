import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const serverDirectory = resolve(root, "dist", "server");
const metadataDirectory = resolve(root, "dist", ".openai");

await mkdir(serverDirectory, { recursive: true });
await mkdir(metadataDirectory, { recursive: true });

await writeFile(
  resolve(serverDirectory, "index.js"),
  `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    if (request.method === "GET" && !url.pathname.includes(".")) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    }

    return response;
  },
};

export default worker;
`,
);

await copyFile(
  resolve(root, ".openai", "hosting.json"),
  resolve(metadataDirectory, "hosting.json"),
);
