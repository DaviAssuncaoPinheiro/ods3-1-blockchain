import { connectToNetwork, deployProductPass } from "./lib/deployment.js";
import { runScript } from "./lib/runScript.js";

const adminName = process.env.ADMIN_NAME ?? "Administrador da Rede";

await runScript(async () => {
  const connection = await connectToNetwork();
  await deployProductPass(connection, adminName);
});
