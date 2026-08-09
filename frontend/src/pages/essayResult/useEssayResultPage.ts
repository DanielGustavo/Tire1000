import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BLOCKED_ESSAY_RESULT_STATUSES } from "../../services/essayService";
import { useEssayDetail } from "../../hooks/queries/useEssayDetail";

export function useEssayResultPage() {
  const { essayId } = useParams<{ essayId: string }>();
  const navigate = useNavigate();

  const essayQuery = useEssayDetail(essayId);

  const status = essayQuery.data?.essay.status;
  const blocked = Boolean(status && BLOCKED_ESSAY_RESULT_STATUSES.includes(status));

  // REJECTED/UPLOAD_FAILED/VALIDATION_FAILED/EVALUATION_FAILED aren't shown here — the Homepage list
  // is where the user acts on them (resend, or nothing for EVALUATION_FAILED).
  useEffect(() => {
    if (blocked) navigate("/", { replace: true });
  }, [blocked, navigate]);

  return { essayQuery, blocked };
}
