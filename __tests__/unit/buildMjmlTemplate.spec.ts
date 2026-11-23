import { join } from "path";
import { buildMjmlTemplate } from "../../src";

describe("buildMjmlTemplate", () => {
  it("should fail if template folder does not exist", async () => {
    await expect(
      buildMjmlTemplate(
        {
          templateFolder: join(__dirname, "folderThatDoesNotExist"),
        },
        { templateName: "templateThatDoesNotExist" }
      )
    ).rejects.toThrow();
  });

  it("should fail if template does not exist", async () => {
    await expect(
      buildMjmlTemplate(
        {
          templateFolder: join(__dirname, "../resources"),
        },
        { templateName: "templateThatDoesNotExist" }
      )
    ).rejects.toThrow();
  });

  it("should fail if mjml template is invalid", async () => {
    await expect(
      buildMjmlTemplate(
        {
          templateFolder: join(__dirname, "../resources"),
        },
        { templateName: "test-invalid" }
      )
    ).rejects.toThrow();
  });

  it("should compile a template without template data", async () => {
    const mailHtmlContent = await buildMjmlTemplate(
      {
        templateFolder: join(__dirname, "../resources"),
      },
      { templateName: "test" }
    );

    expect(mailHtmlContent).toBeDefined();
  });

  it("should compile a template with template data and html content should be replaced", async () => {
    const mailHtmlContent = await buildMjmlTemplate(
      {
        templateFolder: join(__dirname, "../resources"),
      },
      {
        templateName: "test-mustache",
        templateData: {
          testKey: "testKey",
          testKeyNested: {
            nestedKey: "nestedKey",
          },
        },
      }
    );

    expect(mailHtmlContent).toBeDefined();
    expect(mailHtmlContent).toContain("testKey");
    expect(mailHtmlContent).toContain("nestedKey");
  });

  it("should compile a template with html content and escape that by default", async () => {
    const mailHtmlContent = await buildMjmlTemplate(
      {
        templateFolder: join(__dirname, "../resources"),
      },
      {
        templateName: "test-mustache",
        templateData: {
          testKey: "<h1>testKey</h1>",
          testKeyNested: {
            nestedKey: "nestedKey",
          },
        },
      }
    );

    expect(mailHtmlContent).toBeDefined();
    console.log(mailHtmlContent);
    expect(mailHtmlContent).toContain("&lt;h1&gt;testKey&lt;&#x2F;h1&gt;");
    expect(mailHtmlContent).toContain("nestedKey");
  });

  it("should compile a template using mjml-include tag", async () => {
    const mailHtmlContent = await buildMjmlTemplate(
      {
        templateFolder: join(__dirname, "../resources"),
      },
      { templateName: "test-include/test-include" }
    );

    expect(mailHtmlContent).toBeDefined();
    expect(mailHtmlContent).toContain("This is a header");
  });

  describe("Layout", () => {
    it("should escape html in template data", async () => {
      const mailHtmlContent = await buildMjmlTemplate(
        {
          templateFolder: join(__dirname, "../resources"),
          templatePartialsFolder: "/include",
        },
        {
          templateLayoutName: "layout/layout-single-slot",
          templateData: {
            templateData: "<h1>templateData</h1>",
          },
        }
      );

      expect(mailHtmlContent).toContain(
        "&lt;h1&gt;templateData&lt;&#x2F;h1&gt;"
      );
      expect(mailHtmlContent).not.toContain("<h1>templateData</h1>");
    });

    it.each([false, true])(
      "should not expand mustache tags inside template data (minifyHtmlOutput: %s)",
      async (minifyHtmlOutput) => {
        const mailHtmlContent = await buildMjmlTemplate(
          {
            templateFolder: join(__dirname, "../resources"),
            templatePartialsFolder: "/include",
            minifyHtmlOutput,
          },
          {
            templateLayoutName: "layout/layout-single-slot",
            templateData: {
              templateData: "{{{secret}}} {{secret}}",
              secret: "<b>secret value</b>",
            },
          }
        );

        expect(mailHtmlContent).toContain(
          "&#123;&#123;&#123;secret&#125;&#125;&#125; &#123;&#123;secret&#125;&#125;"
        );
        expect(mailHtmlContent).not.toContain("secret value");
      }
    );
  });
});
