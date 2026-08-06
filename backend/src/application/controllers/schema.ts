import { flattenError, type ZodType } from "zod";
import { FieldsError } from "../../shared/errors/fields-error.js";

export abstract class Schema<T> {
  protected abstract readonly definition: ZodType<T>;

  parse(body: unknown): T {
    const result = this.definition.safeParse(body);

    if (!result.success) {
      const { formErrors, fieldErrors } = flattenError(result.error);
      const fields = fieldErrors as Record<string, string[]>;
      if (formErrors.length > 0) {
        fields._ = formErrors;
      }
      throw new FieldsError(fields);
    }

    return result.data;
  }
}
