import { RegisterProductForm } from "@/components/forms/RegisterProductForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function RegisterProductPage() {
  return (
    <>
      <PageHeader
        title="Register Product"
        description="Manufacturers create the product's digital passport. The product ID must be unique on the blockchain."
      />
      <Panel title="Product data" description="Requires the Manufacturer role.">
        <RegisterProductForm />
      </Panel>
    </>
  );
}
