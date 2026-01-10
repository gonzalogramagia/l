import { SymbolBrowser } from "../components/symbol-browser";
import { useLanguage } from "../contexts/language-context";

export default function EmojisPage() {
  const { t } = useLanguage();

  return (
    <section>
      <SymbolBrowser />

      <br />

      <p className="text-neutral-600">
        {t("link.more_emojis")}{" "}
        <a
          href="https://es.piliapp.com/twitter-symbols/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          https://es.piliapp.com/twitter-symbols/
        </a>
      </p>

      <br />
      <br />
      <br />
      <br />
    </section>
  );
}
