import { connectToNetwork, deployProductPass } from "./lib/deployment.js";
import { runScript } from "./lib/runScript.js";

const Role = { Manufacturer: 1, Retailer: 2, ServiceCenter: 3 } as const;

const SAMPLE_PRODUCT = {
  productId: "PP-0001",
  serialNumber: "SN-2026-000001",
  name: "Aurora Smartwatch",
  model: "AW-200",
};

const shouldSkipSampleProduct = process.env.SKIP_SAMPLE_PRODUCT === "true";

await runScript(async () => {
  const connection = await connectToNetwork();
  const [admin, manufacturer, retailer, serviceCenter] = await connection.ethers.getSigners();
  const productPass = await deployProductPass(connection);

  const participants = [
    { label: "Manufacturer", signer: manufacturer, role: Role.Manufacturer },
    { label: "Retailer", signer: retailer, role: Role.Retailer },
    { label: "Service Center", signer: serviceCenter, role: Role.ServiceCenter },
  ];

  for (const participant of participants) {
    const transaction = await productPass.grantRole(participant.signer.address, participant.role);
    await transaction.wait();
  }

  if (!shouldSkipSampleProduct) {
    const { productId, serialNumber, name, model } = SAMPLE_PRODUCT;
    const transaction = await productPass
      .connect(manufacturer)
      .registerProduct(productId, serialNumber, name, model);
    await transaction.wait();
    console.log(`Sample product "${productId}" registered`);
  }

  console.log("\nDemo accounts (Hardhat default accounts):");
  console.table([
    { role: "Admin", address: admin.address, hardhatAccount: 0 },
    ...participants.map((participant, index) => ({
      role: participant.label,
      address: participant.signer.address,
      hardhatAccount: index + 1,
    })),
  ]);
});
