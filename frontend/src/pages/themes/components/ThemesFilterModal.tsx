import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../components/Button";
import { Modal } from "../../../components/Modal";
import { Select } from "../../../components/Select";
import { topicService } from "../../../services/topicService";

const ALL_TOPICS_OPTION = { value: "", label: "Todos os eixos" };

type ThemesFilterModalProps = {
  topicId: string;
  onApply: (topicId: string) => void;
  onClose: () => void;
};

export function ThemesFilterModal({ topicId, onApply, onClose }: ThemesFilterModalProps) {
  const [pendingTopicId, setPendingTopicId] = useState(topicId);
  const topicsQuery = useQuery({ queryKey: ["topics"], queryFn: () => topicService.list() });
  const options = [
    ALL_TOPICS_OPTION,
    ...(topicsQuery.data?.map((topic) => ({ value: topic.id, label: topic.title })) ?? []),
  ];

  return (
    <Modal onClose={onClose}>
      <p className="w-full text-center text-title font-extrabold text-neutral-900">Filtro de temas</p>

      <Select
        label="Eixo do tema"
        placeholder="Escolha um eixo"
        options={options}
        value={pendingTopicId}
        onChange={setPendingTopicId}
        loading={topicsQuery.isPending}
      />

      <div className="flex w-full gap-2">
        <Button type="button" variant="neutral" className="flex-1" onClick={onClose}>
          Voltar
        </Button>
        <Button type="button" variant="primary" className="flex-1" onClick={() => onApply(pendingTopicId)}>
          Filtrar
        </Button>
      </div>
    </Modal>
  );
}
