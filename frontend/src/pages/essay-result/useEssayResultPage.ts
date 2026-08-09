import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BLOCKED_ESSAY_RESULT_STATUSES, PENDING_STATUSES, essayService } from "../../services/essay-service";

export function useEssayResultPage() {
  const { essayId } = useParams<{ essayId: string }>();
  const navigate = useNavigate();

  const essayQuery = useQuery({
    queryKey: ["essay", essayId],
    queryFn: () => essayService.getById(essayId!),
    enabled: Boolean(essayId),
    refetchInterval: (query) => (query.state.data && PENDING_STATUSES.includes(query.state.data.essay.status) ? 30000 : false),
  });

  const status = essayQuery.data?.essay.status;
  const blocked = Boolean(status && BLOCKED_ESSAY_RESULT_STATUSES.includes(status));

  // REJECTED/UPLOAD_FAILED/VALIDATION_FAILED/EVALUATION_FAILED aren't shown here — the Homepage list
  // is where the user acts on them (resend, or nothing for EVALUATION_FAILED).
  useEffect(() => {
    if (blocked) navigate("/", { replace: true });
  }, [blocked, navigate]);

  return { essayQuery, blocked };
}
