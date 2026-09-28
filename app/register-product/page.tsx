import { RegisterProductForm } from "@/components/forms/RegisterProductForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function RegisterProductPage() {
  return (
    <>
      <PageHeader
        title="Registrar produto"
        description="Fabricantes criam o passaporte digital do produto. O ID do produto deve ser único na blockchain."
      />
      <Panel title="Dados do produto" description="Requer o papel Fabricante.">
        <RegisterProductForm />
      </Panel>
    </>
  );
}
