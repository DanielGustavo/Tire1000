# Falha na Avaliação não devolve crédito; falha na Revisão devolve

Quando a etapa de Avaliação falha por erro de sistema, o crédito do usuário **não** é devolvido — diferente da Revisão, onde tanto rejeição quanto falha de sistema sempre devolvem o crédito. A decisão é reprocessar a mesma redação (o texto já foi extraído na Revisão, então reprocessar a Avaliação não exige novo envio nem novo crédito) depois que o time corrigir o erro e reprocessar a DLQ, em vez de devolver o crédito automaticamente.
