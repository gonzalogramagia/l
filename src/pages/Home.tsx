import { SymbolBrowser } from "../components/symbol-browser";
import { useLanguage } from "../contexts/language-context";

export default function EmojisPage() {
  const { t } = useLanguage();

  return (
    <section>
      <SymbolBrowser />

      <br />

      <p className="text-neutral-600 mt-6">
        {t("link.more_emojis")}{" "}
        <a
          href="https://piliapp.com/twitter-symbols"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          https://piliapp.com/twitter-symbols
        </a>
      </p>
      <br />
    </section>
  );
}
