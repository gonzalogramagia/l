import { SymbolBrowser } from "../components/symbol-browser";

interface HomeProps {
  onEdit?: (symbol: any) => void;
}

export default function EmojisPage({ onEdit }: HomeProps) {


  return (
    <section>
      <SymbolBrowser onEdit={onEdit} />

      <br />


      <br />
    </section>
  );
}
