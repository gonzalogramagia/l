import { SymbolBrowser } from "../components/symbol-browser";

interface HomeProps {
  onEdit?: (symbol: any) => void;
  onCopy?: (symbol: string) => void;
}

export default function EmojisPage({ onEdit, onCopy }: HomeProps) {


  return (
    <section>
      <SymbolBrowser onEdit={onEdit} onCopy={onCopy} />

      <br />


      <br />
    </section>
  );
}
