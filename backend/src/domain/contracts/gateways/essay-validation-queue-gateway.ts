export interface EnqueueEssayValidationMessage {
  essayId: string;
}

/** Producer side of the fila de Revisão — ValidateEssay (ticket 06) consumes what's enqueued here. */
export interface EssayValidationQueueGateway {
  enqueue(message: EnqueueEssayValidationMessage): Promise<void>;
}
