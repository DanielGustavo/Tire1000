import { Link } from "react-router-dom";
import { Camera, ChevronRight, Upload } from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import { Button } from "../../components/Button";
import { PriceModal } from "../../components/PriceModal";
import { ThemeBadges } from "../../components/ThemeBadges";
import { useThemeDetailPage } from "./useThemeDetailPage";

/**
 * Maps markdown headings to the visual scale already used in this design system.
 * `##` reads as an h3 and `###` as an h4 — markdown's h1/h2 are never authored here,
 * since the "Texto motivador N" label above each reference text fills that role.
 */
const referenceTextMarkdownComponents: Components = {
  h2: ({ node, ...props }) => <h3 className="text-default font-bold text-neutral-900" {...props} />,
  h3: ({ node, ...props }) => <h4 className="text-small font-bold text-neutral-900" {...props} />,
  p: ({ node, ...props }) => <p className="text-default text-neutral-600" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 text-default text-neutral-600" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 text-default text-neutral-600" {...props} />,
  li: ({ node, ...props }) => <li className="text-default text-neutral-600" {...props} />,
};

export function ThemeDetailPage() {
  const { themeQuery, ctaDisabled, handleStartEssay, priceModalOpen, setPriceModalOpen } = useThemeDetailPage();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-start gap-4 px-4">
        <Link to="/themes" className="flex items-center gap-0.5 text-small font-bold text-neutral-900">
          <ChevronRight size={16} className="rotate-180" />
          Voltar
        </Link>

        {themeQuery.isPending && <p className="text-default text-neutral-700">Carregando...</p>}
        {themeQuery.isError && <p className="text-default text-error-300">Não foi possível carregar o tema.</p>}

        {themeQuery.isSuccess && (
          <div className="flex flex-col items-start gap-2">
            <ThemeBadges theme={themeQuery.data.theme} topic={themeQuery.data.topic} />
            <h1 className="text-subtitle font-bold capitalize text-neutral-900">{themeQuery.data.theme.title}</h1>
          </div>
        )}
      </div>

      {themeQuery.isSuccess && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            {themeQuery.data.referenceTexts.map((referenceText) => (
              <section key={referenceText.id} className="flex flex-col gap-4 px-4">
                <h2 className="text-subtitle-small font-bold capitalize text-neutral-900">
                  Texto motivador {referenceText.order + 1}
                </h2>
                {referenceText.paragraphs.map((paragraph, index) =>
                  paragraph.type === "TEXT" ? (
                    <Markdown key={index} components={referenceTextMarkdownComponents}>
                      {paragraph.content}
                    </Markdown>
                  ) : (
                    <div key={index} className="flex flex-col gap-2">
                      <img
                        src={paragraph.content.url}
                        alt=""
                        className="w-full border-2 border-solid border-neutral-900 object-fit"
                      />
                      <p className="text-small text-neutral-600">{paragraph.content.font}</p>
                    </div>
                  ),
                )}
                <p className="text-small text-neutral-600">{referenceText.font}</p>
              </section>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 px-4">
            <Button
              variant="primary"
              className="w-full"
              icon={<Camera size={20} />}
              disabled={ctaDisabled}
              onClick={() => handleStartEssay("camera")}
            >
              Tirar foto da redação
            </Button>
            <Button
              variant="primary"
              className="w-full"
              icon={<Upload size={20} />}
              disabled={ctaDisabled}
              onClick={() => handleStartEssay("upload")}
            >
              Fazer upload da redação
            </Button>
          </div>
        </div>
      )}

      {priceModalOpen && <PriceModal onClose={() => setPriceModalOpen(false)} />}
    </div>
  );
}
