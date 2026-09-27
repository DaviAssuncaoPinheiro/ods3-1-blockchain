import { connectToNetwork, deployProductPass } from "./lib/deployment.js";
import { runScript } from "./lib/runScript.js";

await runScript(async () => {
  const connection = await connectToNetwork();
  await deployProductPass(connection);
});
