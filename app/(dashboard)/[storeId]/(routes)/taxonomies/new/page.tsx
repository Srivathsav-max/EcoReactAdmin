
import { TaxonomyForm } from "../components/taxonomy-form";

const NewTaxonomyPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TaxonomyForm />
      </div>
    </div>
  );
};

export default NewTaxonomyPage;