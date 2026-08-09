import { Camera, ChevronRight, Upload } from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import { Button } from "../../components/Button";
import { Loading } from "../../components/Loading";
import { PriceModal } from "../../components/PriceModal";
import { ThemeBadges } from "../../components/ThemeBadges";
import { EssayUploadFlow } from "./components/EssayUploadFlow";
import { useThemeDetailPage } from "./useThemeDetailPage";

/**
 * Maps markdown headings to the visual scale already used in this design system.
 * `##` reads as an h3 and `###` as an h4 — markdown's h1/h2 are never authored here,
 * since the "Texto motivador N" label above each reference text fills that role.
 */
const referenceTextMarkdownComponents: Components = {
  h2: ({ node, ...props }) => <h3 className="text-default font-bold text-neutral-900" {...props} />,
  h3: ({ node, ...props }) => <h4 className="text-small font-bold text-neutral-900" {...props} />,
  p: ({ node, ...props }) => <p className="break-words text-default text-neutral-600" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc break-words pl-5 text-default text-neutral-600" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal break-words pl-5 text-default text-neutral-600" {...props} />,
  li: ({ node, ...props }) => <li className="break-words text-default text-neutral-600" {...props} />,
};

export function ThemeDetailPage() {
  const {
    themeQuery,
    ctaDisabled,
    handleStartEssay,
    handleGoBack,
    priceModalOpen,
    setPriceModalOpen,
    uploadThemeId,
    uploadMode,
    closeUploadFlow,
    handleUploadDone,
  } = useThemeDetailPage();

  return (
    // lg: swaps the stacked mobile column for the Figma desktop frame's 2-column layout
    // (Article Section + a Call to Action card beside it, instead of below it) — teto/padding
    // scoped to this page only, same pattern as tickets 08/09/10.
    <div className="flex w-full flex-col gap-6 lg:mx-auto lg:max-w-[1280px] lg:flex-row lg:items-start lg:gap-16 lg:px-10">
      <div className="flex flex-1 flex-col items-start gap-6 px-4 lg:px-0">
        <div className="flex w-full flex-col items-start gap-4">
          <button
            type="button"
            onClick={handleGoBack}
            className="flex items-center gap-0.5 text-small font-bold text-neutral-900"
          >
            <ChevronRight size={16} className="rotate-180" />
            Voltar
          </button>

          {themeQuery.isPending && <Loading text="Carregando tema..." />}
          {themeQuery.isError && <p className="text-default text-error-300">Não foi possível carregar o tema.</p>}

          {themeQuery.isSuccess && (
            <div className="flex flex-col items-start gap-2">
              <ThemeBadges theme={themeQuery.data.theme} topic={themeQuery.data.topic} />
              <h1 className="text-subtitle font-bold capitalize text-neutral-900">{themeQuery.data.theme.title}</h1>
            </div>
          )}
        </div>

        {themeQuery.isSuccess && (
          <div className="flex flex-col gap-6">
            {themeQuery.data.referenceTexts.map((referenceText) => (
              <section key={referenceText.id} className="flex flex-col gap-4">
                <h2 className="text-subtitle-small font-bold capitalize text-neutral-900">
                  Texto motivador {referenceText.order + 1}
                </h2>
                {referenceText.paragraphs.map((paragraph, index) =>
                  paragraph.type === "TEXT" ? (
                    <Markdown key={index} components={referenceTextMarkdownComponents}>
                      {paragraph.content}
                    </Markdown>
                  ) : (
                    <div key={index} className="flex flex-col gap-2 lg:mx-auto lg:w-[434px]">
                      <img
                        src={paragraph.content.url}
                        alt=""
                        className="w-full border-2 border-solid border-neutral-900 object-fit"
                      />
                      <p className="break-words text-small text-neutral-600">{paragraph.content.font}</p>
                    </div>
                  ),
                )}
                <p className="break-words text-small text-neutral-600">{referenceText.font}</p>
              </section>
            ))}
          </div>
        )}
      </div>

      {themeQuery.isSuccess && (
        // Mobile keeps its own `sticky bottom-0` bar behavior. lg: switches the anchor to the top
        // instead, sticking below AppLayout's fixed 72px header (see AppLayout.tsx) so the card
        // stays visible while the article column beside it scrolls, releasing naturally once this
        // column ends — same sticky-column pattern as ThemesSection.tsx. lg:bottom-auto clears the
        // mobile bottom-0 so only the top offset is active at lg:.
        <div className="sticky bottom-0 z-10 flex flex-col gap-8 border-t-2 border-solid border-neutral-900 bg-neutral-0 px-4 py-2.5 lg:top-[72px] lg:bottom-auto lg:w-[295px] lg:shrink-0 lg:border-2 lg:p-4 lg:shadow-hard">
          <div className="hidden flex-col gap-1 lg:flex">
            <h2 className="text-subtitle font-bold capitalize text-neutral-900">Já finalizou sua redação?</h2>
            <p className="text-default text-neutral-900">Envie-a aqui para que possamos avaliá-la rapidamente!</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="primary"
              className="w-full lg:hidden"
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
              Fazer upload<span className="lg:hidden"> da redação</span>
            </Button>
          </div>
        </div>
      )}

      {priceModalOpen && <PriceModal onClose={() => setPriceModalOpen(false)} />}
      {uploadMode && uploadThemeId && (
        <EssayUploadFlow themeId={uploadThemeId} mode={uploadMode} onClose={closeUploadFlow} onDone={handleUploadDone} />
      )}
    </div>
  );
}
