import type { ReferenceText } from "../../entities/reference-text.js";

export interface ReferenceTextRepository {
  listByThemeId(themeId: string): Promise<ReferenceText[]>;
}
