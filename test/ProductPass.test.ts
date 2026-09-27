import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.connect();

const Role = { Admin: 0, Manufacturer: 1, Retailer: 2, ServiceCenter: 3 } as const;
const ProductStatus = { Manufactured: 0, Sold: 1, Serviced: 2 } as const;
const HistoryEventType = { Registered: 0, Sold: 1, Maintenance: 2 } as const;

const SAMPLE_PRODUCT = {
  productId: "PP-0001",
  serialNumber: "SN-A1B2C3",
  name: "Smartphone X",
  model: "X-2026",
};
const WARRANTY_MONTHS = 12n;
const SECONDS_PER_MONTH = 30n * 24n * 60n * 60n;
const MAINTENANCE_DESCRIPTION = "Battery replaced";

async function deployFixture() {
  const [admin, manufacturer, retailer, serviceCenter, outsider] = await ethers.getSigners();
  const productPass = await ethers.deployContract("ProductPass");
  return { productPass, admin, manufacturer, retailer, serviceCenter, outsider };
}

async function configuredRolesFixture() {
  const context = await deployFixture();
  const { productPass, manufacturer, retailer, serviceCenter } = context;
  await productPass.grantRole(manufacturer.address, Role.Manufacturer);
  await productPass.grantRole(retailer.address, Role.Retailer);
  await productPass.grantRole(serviceCenter.address, Role.ServiceCenter);
  return context;
}

async function registeredProductFixture() {
  const context = await networkHelpers.loadFixture(configuredRolesFixture);
  const { productId, serialNumber, name, model } = SAMPLE_PRODUCT;
  await context.productPass
    .connect(context.manufacturer)
    .registerProduct(productId, serialNumber, name, model);
  return context;
}

async function soldProductFixture() {
  const context = await networkHelpers.loadFixture(registeredProductFixture);
  await context.productPass
    .connect(context.retailer)
    .registerSale(SAMPLE_PRODUCT.productId, WARRANTY_MONTHS);
  return context;
}

describe("ProductPass", function () {
  describe("Roles", function () {
    it("grants the admin role to the deployer", async function () {
      const { productPass, admin } = await networkHelpers.loadFixture(deployFixture);

      expect(await productPass.hasRole(admin.address, Role.Admin)).to.equal(true);
    });

    it("lets the admin grant the manufacturer role", async function () {
      const { productPass, admin, manufacturer } = await networkHelpers.loadFixture(deployFixture);

      await expect(productPass.grantRole(manufacturer.address, Role.Manufacturer))
        .to.emit(productPass, "RoleGranted")
        .withArgs(manufacturer.address, Role.Manufacturer, admin.address);
      expect(await productPass.hasRole(manufacturer.address, Role.Manufacturer)).to.equal(true);
    });

    it("lets the admin grant the retailer role", async function () {
      const { productPass, retailer } = await networkHelpers.loadFixture(deployFixture);

      await productPass.grantRole(retailer.address, Role.Retailer);

      expect(await productPass.hasRole(retailer.address, Role.Retailer)).to.equal(true);
    });

    it("lets the admin grant the service center role", async function () {
      const { productPass, serviceCenter } = await networkHelpers.loadFixture(deployFixture);

      await productPass.grantRole(serviceCenter.address, Role.ServiceCenter);

      expect(await productPass.hasRole(serviceCenter.address, Role.ServiceCenter)).to.equal(true);
    });

    it("rejects role grants from non-admin accounts", async function () {
      const { productPass, outsider } = await networkHelpers.loadFixture(deployFixture);

      await expect(productPass.connect(outsider).grantRole(outsider.address, Role.Manufacturer))
        .to.be.revertedWithCustomError(productPass, "MissingRole")
        .withArgs(outsider.address, Role.Admin);
    });

    it("rejects granting a role twice", async function () {
      const { productPass, manufacturer } = await networkHelpers.loadFixture(configuredRolesFixture);

      await expect(
        productPass.grantRole(manufacturer.address, Role.Manufacturer),
      ).to.be.revertedWithCustomError(productPass, "RoleAlreadyGranted");
    });
  });

  describe("registerProduct", function () {
    it("lets a manufacturer register a product", async function () {
      const { productPass, manufacturer } = await networkHelpers.loadFixture(configuredRolesFixture);
      const { productId, serialNumber, name, model } = SAMPLE_PRODUCT;

      await expect(
        productPass.connect(manufacturer).registerProduct(productId, serialNumber, name, model),
      )
        .to.emit(productPass, "ProductRegistered")
        .withArgs(ethers.id(productId), productId, serialNumber, manufacturer.address, anyTimestamp);
      expect(await productPass.totalProducts()).to.equal(1n);
    });

    it("rejects a duplicated product", async function () {
      const { productPass, manufacturer } = await networkHelpers.loadFixture(registeredProductFixture);
      const { productId, serialNumber, name, model } = SAMPLE_PRODUCT;

      await expect(
        productPass.connect(manufacturer).registerProduct(productId, serialNumber, name, model),
      )
        .to.be.revertedWithCustomError(productPass, "ProductAlreadyExists")
        .withArgs(productId);
    });

    it("rejects registration by an account without the manufacturer role", async function () {
      const { productPass, outsider } = await networkHelpers.loadFixture(configuredRolesFixture);
      const { productId, serialNumber, name, model } = SAMPLE_PRODUCT;

      await expect(
        productPass.connect(outsider).registerProduct(productId, serialNumber, name, model),
      )
        .to.be.revertedWithCustomError(productPass, "MissingRole")
        .withArgs(outsider.address, Role.Manufacturer);
    });

    it("rejects an empty product ID", async function () {
      const { productPass, manufacturer } = await networkHelpers.loadFixture(configuredRolesFixture);
      const { serialNumber, name, model } = SAMPLE_PRODUCT;

      await expect(productPass.connect(manufacturer).registerProduct("", serialNumber, name, model))
        .to.be.revertedWithCustomError(productPass, "EmptyField")
        .withArgs("productId");
    });

    it("rejects an empty serial number", async function () {
      const { productPass, manufacturer } = await networkHelpers.loadFixture(configuredRolesFixture);
      const { productId, name, model } = SAMPLE_PRODUCT;

      await expect(productPass.connect(manufacturer).registerProduct(productId, "", name, model))
        .to.be.revertedWithCustomError(productPass, "EmptyField")
        .withArgs("serialNumber");
    });
  });

  describe("registerSale", function () {
    it("lets a retailer register a sale with warranty", async function () {
      const { productPass, retailer } = await networkHelpers.loadFixture(registeredProductFixture);

      await expect(
        productPass.connect(retailer).registerSale(SAMPLE_PRODUCT.productId, WARRANTY_MONTHS),
      ).to.emit(productPass, "ProductSold");

      const product = await productPass.getProduct(SAMPLE_PRODUCT.productId);
      expect(product.status).to.equal(ProductStatus.Sold);
      expect(product.soldAt).to.be.greaterThan(0n);
      expect(product.warrantyExpiresAt).to.equal(product.soldAt + WARRANTY_MONTHS * SECONDS_PER_MONTH);
    });

    it("rejects a sale by an account without the retailer role", async function () {
      const { productPass, outsider } = await networkHelpers.loadFixture(registeredProductFixture);

      await expect(
        productPass.connect(outsider).registerSale(SAMPLE_PRODUCT.productId, WARRANTY_MONTHS),
      )
        .to.be.revertedWithCustomError(productPass, "MissingRole")
        .withArgs(outsider.address, Role.Retailer);
    });

    it("rejects the sale of a nonexistent product", async function () {
      const { productPass, retailer } = await networkHelpers.loadFixture(configuredRolesFixture);

      await expect(productPass.connect(retailer).registerSale("UNKNOWN", WARRANTY_MONTHS))
        .to.be.revertedWithCustomError(productPass, "ProductNotFound")
        .withArgs("UNKNOWN");
    });

    it("rejects a duplicated sale", async function () {
      const { productPass, retailer } = await networkHelpers.loadFixture(soldProductFixture);

      await expect(
        productPass.connect(retailer).registerSale(SAMPLE_PRODUCT.productId, WARRANTY_MONTHS),
      )
        .to.be.revertedWithCustomError(productPass, "ProductAlreadySold")
        .withArgs(SAMPLE_PRODUCT.productId);
    });

    it("rejects a zero-month warranty", async function () {
      const { productPass, retailer } = await networkHelpers.loadFixture(registeredProductFixture);

      await expect(productPass.connect(retailer).registerSale(SAMPLE_PRODUCT.productId, 0n))
        .to.be.revertedWithCustomError(productPass, "InvalidWarrantyDuration")
        .withArgs(0n);
    });
  });

  describe("registerMaintenance", function () {
    it("lets a service center register maintenance", async function () {
      const { productPass, serviceCenter } = await networkHelpers.loadFixture(soldProductFixture);

      await expect(
        productPass
          .connect(serviceCenter)
          .registerMaintenance(SAMPLE_PRODUCT.productId, MAINTENANCE_DESCRIPTION),
      )
        .to.emit(productPass, "MaintenanceRegistered")
        .withArgs(
          ethers.id(SAMPLE_PRODUCT.productId),
          SAMPLE_PRODUCT.productId,
          serviceCenter.address,
          MAINTENANCE_DESCRIPTION,
          anyTimestamp,
        );

      const product = await productPass.getProduct(SAMPLE_PRODUCT.productId);
      expect(product.maintenanceCount).to.equal(1n);
      expect(product.status).to.equal(ProductStatus.Serviced);
    });

    it("rejects maintenance by an account without the service center role", async function () {
      const { productPass, outsider } = await networkHelpers.loadFixture(soldProductFixture);

      await expect(
        productPass
          .connect(outsider)
          .registerMaintenance(SAMPLE_PRODUCT.productId, MAINTENANCE_DESCRIPTION),
      )
        .to.be.revertedWithCustomError(productPass, "MissingRole")
        .withArgs(outsider.address, Role.ServiceCenter);
    });

    it("rejects maintenance of a nonexistent product", async function () {
      const { productPass, serviceCenter } = await networkHelpers.loadFixture(configuredRolesFixture);

      await expect(
        productPass.connect(serviceCenter).registerMaintenance("UNKNOWN", MAINTENANCE_DESCRIPTION),
      )
        .to.be.revertedWithCustomError(productPass, "ProductNotFound")
        .withArgs("UNKNOWN");
    });

    it("rejects a description longer than the limit", async function () {
      const { productPass, serviceCenter } = await networkHelpers.loadFixture(soldProductFixture);
      const maxLength = await productPass.MAX_DESCRIPTION_LENGTH();
      const longDescription = "x".repeat(Number(maxLength) + 1);

      await expect(
        productPass.connect(serviceCenter).registerMaintenance(SAMPLE_PRODUCT.productId, longDescription),
      ).to.be.revertedWithCustomError(productPass, "DescriptionTooLong");
    });
  });

  describe("Queries", function () {
    it("returns the product data", async function () {
      const { productPass, manufacturer } = await networkHelpers.loadFixture(registeredProductFixture);

      const product = await productPass.getProduct(SAMPLE_PRODUCT.productId);

      expect(product.productId).to.equal(SAMPLE_PRODUCT.productId);
      expect(product.serialNumber).to.equal(SAMPLE_PRODUCT.serialNumber);
      expect(product.name).to.equal(SAMPLE_PRODUCT.name);
      expect(product.model).to.equal(SAMPLE_PRODUCT.model);
      expect(product.manufacturer).to.equal(manufacturer.address);
      expect(product.manufacturedAt).to.be.greaterThan(0n);
      expect(product.soldAt).to.equal(0n);
      expect(product.status).to.equal(ProductStatus.Manufactured);
      expect(product.maintenanceCount).to.equal(0n);
    });

    it("returns the full product history in order", async function () {
      const { productPass, manufacturer, retailer, serviceCenter } =
        await networkHelpers.loadFixture(soldProductFixture);
      await productPass
        .connect(serviceCenter)
        .registerMaintenance(SAMPLE_PRODUCT.productId, MAINTENANCE_DESCRIPTION);

      const history = await productPass.getProductHistory(SAMPLE_PRODUCT.productId);

      expect(history.map((entry) => entry.eventType)).to.deep.equal([
        BigInt(HistoryEventType.Registered),
        BigInt(HistoryEventType.Sold),
        BigInt(HistoryEventType.Maintenance),
      ]);
      expect(history.map((entry) => entry.actor)).to.deep.equal([
        manufacturer.address,
        retailer.address,
        serviceCenter.address,
      ]);
      expect(history[2].details).to.equal(MAINTENANCE_DESCRIPTION);
    });

    it("rejects queries for a nonexistent product", async function () {
      const { productPass } = await networkHelpers.loadFixture(deployFixture);

      await expect(productPass.getProduct("UNKNOWN"))
        .to.be.revertedWithCustomError(productPass, "ProductNotFound")
        .withArgs("UNKNOWN");
    });
  });
});

function anyTimestamp(value: bigint): boolean {
  return value > 0n;
}
