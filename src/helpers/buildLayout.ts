import { access, readFile } from "fs/promises";
import { escape, render } from "mustache";
import { dirname, join } from "path";
import { BuildLayoutTemplateOptions } from "../types/BuildLayoutTemplateOptions";

const BRACE_ENTITIES: Record<string, string> = { "{": "&#123;", "}": "&#125;" };

// buildMjmlTemplate renders the compiled HTML with Mustache a second time, to fill in the tags of the included slots.
// Mustache's own escaping leaves braces alone, so a value like "{{{other}}}" would pass through here and expand unescaped in that second render.
// As entities the braces still display as braces, but Mustache no longer reads them as tags.
const escapeTemplateData = (value: unknown) =>
  escape(value).replace(/[{}]/g, (brace) => BRACE_ENTITIES[brace]);

export const buildLayout = async (
  options: BuildLayoutTemplateOptions,
  templateData = {}
) => {
  const {
    templateLayoutSlots,
    templateLayoutName,
    templatePartialsFolder,
    templateFolder,
  } = options;

  const layoutFilePath = join(templateFolder, `${templateLayoutName}.mjml`);

  const layoutFileContent = await readFile(layoutFilePath, "utf-8").catch(
    () => {
      throw new Error(
        `[nodemailer-mjml] - Could not read layout template at path: ${layoutFilePath}`
      );
    }
  );

  const layoutSlotsName = Array.from(
    layoutFileContent.matchAll(/\{{2}.*slots:(\w*).*\}{2}/g)
  ).map((slot) => slot[1]);

  const layoutSlotsContent = Object.fromEntries(
    await Promise.all(
      layoutSlotsName.map(async (slotName) => {
        const dirBackwardWalk = Array.from(
          {
            length: dirname(`${templateLayoutName}.mjml`)
              .split("/")
              .filter((path) => path !== ".").length,
          },
          () => "../"
        ).join("");

        const slotContent = (templateLayoutSlots ?? {})[slotName];
        if (slotContent) {
          return [
            `slots:${slotName}`,
            `<mj-include path="${join(dirBackwardWalk, slotContent)}.mjml" />`,
          ];
        }

        if (templatePartialsFolder) {
          const defaultSlotFilePath = join(
            templateFolder,
            templatePartialsFolder,
            `${slotName}.mjml`
          );

          try {
            await access(defaultSlotFilePath);
            return [
              `slots:${slotName}`,
              `<mj-include path="${join(
                dirBackwardWalk,
                templatePartialsFolder,
                `${slotName}.mjml`
              )}" />`,
            ];
          } catch (error) {
            /* do nothing */
          }
        }

        return [`slots:${slotName}`, ""];
      })
    )
  );

  return render(
    layoutFileContent,
    { ...layoutSlotsContent, ...templateData },
    {},
    { escape: escapeTemplateData }
  );
};
