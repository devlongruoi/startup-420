import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Editor Content")
    .items([
      S.documentTypeListItem("author").title("Tác giả"),
      S.documentTypeListItem("startup").title("Startups"),
      S.documentTypeListItem("playlist").title("Danh sách"),
    ]);