import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "../libs/axios";
import { essayService } from "../services/essay-service";
import { themeService } from "../services/theme-service";

const MAX_PHOTO_SIZE_IN_BYTES = 10 * 1024 * 1024;

export function EssayUploadPage() {
  const [searchParams] = useSearchParams();
  const [themeId, setThemeId] = useState(searchParams.get("themeId") ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const themesQuery = useQuery({ queryKey: ["themes"], queryFn: () => themeService.list() });

  const uploadMutation = useMutation({
    mutationFn: async ({ themeId, photo }: { themeId: string; photo: File }) => {
      const { essayId, upload } = await essayService.upload(themeId);
      await essayService.uploadPhoto(upload, photo);
      return essayId;
    },
  });

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && file.size > MAX_PHOTO_SIZE_IN_BYTES) {
      setPhoto(null);
      setFileError("A foto deve ter no máximo 10MB.");
      return;
    }
    setFileError(null);
    setPhoto(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!themeId || !photo) return;
    uploadMutation.mutate({ themeId, photo });
  }

  if (uploadMutation.isSuccess) {
    return (
      <main className="min-h-screen p-4">
        <h1 className="text-2xl font-semibold text-gray-900">Redação enviada!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sua foto foi enviada e entrou na fila de Revisão. Assim que a Correção terminar, o resultado aparece no seu
          histórico.
        </p>
        <p className="mt-6 text-sm">
          <Link to="/themes" className="font-medium text-gray-900 underline">
            Voltar para temas
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-semibold text-gray-900">Enviar redação</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
        <div>
          <label htmlFor="themeId" className="block text-sm font-medium text-gray-700">
            Tema
          </label>
          <select
            id="themeId"
            required
            value={themeId}
            onChange={(event) => setThemeId(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              Selecione um tema
            </option>
            {themesQuery.data?.map(({ theme }) => (
              <option key={theme.id} value={theme.id}>
                {theme.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
            Foto da redação
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            capture="environment"
            required
            onChange={handlePhotoChange}
            className="mt-1 w-full text-sm text-gray-700"
          />
          <p className="mt-1 text-xs text-gray-500">Tamanho máximo: 10MB.</p>
        </div>

        {fileError && <p className="text-sm text-red-600">{fileError}</p>}
        {uploadMutation.isError && (
          <p className="text-sm text-red-600">
            {getApiErrorMessage(uploadMutation.error, "Não foi possível enviar sua redação. Tente novamente.")}
          </p>
        )}

        <button
          type="submit"
          disabled={uploadMutation.isPending || !themeId || !photo}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {uploadMutation.isPending ? "Enviando..." : "Enviar redação"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/themes" className="font-medium text-gray-900 underline">
          Voltar
        </Link>
      </p>
    </main>
  );
}
