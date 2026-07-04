import { pagesConfig } from "../../../generated/pages.config.ts";

export function usePageBController(): { title: string } {
  const title = pagesConfig.find((page) => page.path === "pages/page-b/index")?.style.navigationBarTitleText ?? "Page B";
  return { title };
}
