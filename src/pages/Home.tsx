import { SymbolBrowser } from "../components/symbol-browser";

export default function EmojisPage() {
  return (
    <section>
      <SymbolBrowser />

      <br />

      <p className="text-neutral-600 dark:text-neutral-400">
        Más emojis en:{" "}
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
