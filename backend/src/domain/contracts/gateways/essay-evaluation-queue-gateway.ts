export interface EnqueueEssayEvaluationMessage {
  essayId: string;
}

/** Producer side of the fila de Avaliação — ValidateEssay enqueues here on success; EvaluateEssay (ticket 07) consumes it. */
export interface EssayEvaluationQueueGateway {
  enqueue(message: EnqueueEssayEvaluationMessage): Promise<void>;
}
