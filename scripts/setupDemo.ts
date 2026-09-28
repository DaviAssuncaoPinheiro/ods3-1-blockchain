import { connectToNetwork, deployProductPass } from "./lib/deployment.js";
import { runScript } from "./lib/runScript.js";

const Role = { Manufacturer: 1, Retailer: 2, ServiceCenter: 3 } as const;

const ADMIN_NAME = "Administrador da Rede";

const SAMPLE_PRODUCT = {
  productId: "PP-0001",
  serialNumber: "SN-2026-000001",
  name: "Smartwatch Aurora",
  model: "AW-200",
};

const shouldSkipSampleProduct = process.env.SKIP_SAMPLE_PRODUCT === "true";

await runScript(async () => {
  const connection = await connectToNetwork();
  const [admin, manufacturer, retailer, serviceCenter] = await connection.ethers.getSigners();
  const productPass = await deployProductPass(connection, ADMIN_NAME);

  const participants = [
    { label: "Fabricante", name: "Aurora Eletrônicos S.A.", signer: manufacturer, role: Role.Manufacturer },
    { label: "Varejista", name: "Loja Centro Tech", signer: retailer, role: Role.Retailer },
    { label: "Assistência técnica", name: "Assistência Técnica Rápida", signer: serviceCenter, role: Role.ServiceCenter },
  ];

  for (const participant of participants) {
    const transaction = await productPass.grantRole(
      participant.signer.address,
      participant.role,
      participant.name,
    );
    await transaction.wait();
  }

  if (!shouldSkipSampleProduct) {
    const { productId, serialNumber, name, model } = SAMPLE_PRODUCT;
    const transaction = await productPass
      .connect(manufacturer)
      .registerProduct(productId, serialNumber, name, model);
    await transaction.wait();
    console.log(`Produto de exemplo "${productId}" registrado`);
  }

  console.log("\nContas de demonstração (contas padrão do Hardhat):");
  console.table([
    { papel: "Administrador", nome: ADMIN_NAME, endereco: admin.address, contaHardhat: 0 },
    ...participants.map((participant, index) => ({
      papel: participant.label,
      nome: participant.name,
      endereco: participant.signer.address,
      contaHardhat: index + 1,
    })),
  ]);
});
