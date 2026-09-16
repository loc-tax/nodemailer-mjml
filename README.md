> [!NOTE]
> This is the Loctax fork of [Thomascogez/nodemailer-mjml](https://github.com/Thomascogez/nodemailer-mjml), published as [`@loctax/nodemailer-mjml`](https://www.npmjs.com/package/@loctax/nodemailer-mjml).
> It HTML-escapes `templateData` in layouts by default, so use `{{{value}}}` for raw values and `{{{ slots:header }}}` for slots.
> See [Releasing](#releasing) and [Syncing with upstream](#syncing-with-upstream) for how the fork is maintained.

> [!WARNING]  
> 3.0.0 includes the upstream 1.4.0 breaking changes, see the [migration guide](./MIGRATION_GUIDES/FROM_1.3.X_TO_1.4.md).

<h1 align="center">
  <br>
  Nodemailer-mjml
  <br>
</h1>

<h4 align="center">
<b>nodemailer-mjml</b> is a plug-and-play solution for sending <a href="https://github.com/mjmlio/mjml"><b>MJML</b></a> mail using <a href="https://github.com/nodemailer/nodemailer"><b>nodemailer</b></a>. It not only bring a compatibility layer between <b>MJML</b> and <b>nodemailer<b> it also allow to render dynamic content using <b>mustache</b> templating

</h4>

<p align="center">
  <a href="https://www.npmjs.com/package/@loctax/nodemailer-mjml">
    <img src="https://img.shields.io/npm/v/@loctax/nodemailer-mjml.svg" alt="@loctax/nodemailer-mjml">
  </a>
  <a href="https://github.com/loc-tax/nodemailer-mjml/actions/workflows/ci.yaml"><img src="https://github.com/loc-tax/nodemailer-mjml/actions/workflows/ci.yaml/badge.svg"></a>
</p>

---

## Installation

```sh
pnpm add @loctax/nodemailer-mjml
```

## Basic usage

```ts
import { createTransport } from "nodemailer";
import { nodemailerMjmlPlugin } from "@loctax/nodemailer-mjml";

const transport = createTransport({...});

// Register nodemailer-mjml to your nodemailer transport
transport.use('compile', nodemailerMjmlPlugin({/*Pass desired plugin options here*/}));

```

## Usage examples

### With template

![Template-overview](./assets/template-overview.png)
> using `nodemailer-mjml` with a template is the simplest to start

```ts
import { createTransport } from "nodemailer";
import { nodemailerMjmlPlugin } from "@loctax/nodemailer-mjml";
import { join } from "path";

const transport = createTransport({
    host: "localhost",
    port: 25
});

transport.use(
    "compile",
    nodemailerMjmlPlugin({ templateFolder: join(__dirname, "mailTemplates") })
);

const sendTemplatedEmail = async () => {
    await transport.sendMail({
        from: '"John doe" <john.doe@example.com>',
        to: "doe.john@.com",
        subject: "Welcome",
        templateName: "simpleTemplate", // <- Targeted template name
        templateData: { // <- Data to be injected in the template
            companyLogoURL: "https://www.kadencewp.com/wp-content/uploads/2020/10/alogo-2.png",
            heroImageURL: "https://www.kadencewp.com/wp-content/uploads/2020/10/alogo-2.png",
            articles: [
                {
                    articleImageURL: "https://api.lorem.space/image/watch?w=150&h=150",
                    articleName: "Watch 1",
                    articleDescription: "lorem ipsum dolor sit amet",
                },
                {
                    articleImageURL: "https://api.lorem.space/image/watch?w=150&h=150",
                    articleName: "Watch 2",
                    articleDescription: "lorem ipsum dolor sit amet"
                },
                {
                    articleImageURL: "https://api.lorem.space/image/watch?w=150&h=150",
                    articleName: "Watch 3",
                    articleDescription: "lorem ipsum dolor sit amet"
                },
            ]
        },
    });
};

sendTemplatedEmail();
```

> This complete example can be found in the [examples](./examples/simpleTemplate.ts) folder

### With layout template

![Layout-overview](./assets/template-layout-overview.png)
> Template layout allow to reuse the same layout for multiple templates

```ts
import { createTransport } from "nodemailer";
import { nodemailerMjmlPlugin } from "@loctax/nodemailer-mjml";
import { join } from "path";

const transport = createTransport({
    host: "localhost",
    port: 25
});

transport.use(
    "compile",
    nodemailerMjmlPlugin({ templateFolder: join(__dirname, "mailTemplates") })
);

const sendTemplatedEmail = async () => {
    await transport.sendMail({
        from: '"John doe" <john.doe@example.com>',
        to: "doe.john@.com",
        subject: "Welcome",
        templateLayoutName: "layoutTemplate",
        templateLayoutSlots: {
            header: "partials/header",
            content: "partials/content",
            footer: "partials/footer",
        },
        templateData: {
            content: {
                imageURL: "http://5vph.mj.am/img/5vph/b/1g8pi/068ys.png"
            }
        }
    });
};

sendTemplatedEmail();
```

> This complete example can be found in the [examples](./examples/layoutTemplate.ts) folder

## Documentation

### Plugin options

> Plugin options are defined by the **IPluginOptions** interface

| option                  | type               | description                                                                                                                                                                           | default                     |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| templateFolder          | string             | Path of the dir containing your **MJML** template                                                                                                                                     | undefined                   |
| templatePartialsFolder? | string             | Path relative to **templateFolder**, if defined when using a template layout it will be folder where **nodemailer-mjml** while try to find fallback slots if one or more is undefined | undefined                   |
| mjmlOptions?            | MJMLParsingOptions | Options that would be passed to **MJML** compiler (see more) [mjml doc](https://github.com/mjmlio/mjml)                                                                               | {validationLevel: "strict"} |
| minifyHtmlOutput?       | boolean            | use to enable/disable html minification using **htmlnano**, if enabled make sure to install **htmlnano** as a devdependencies                                                                                                                       | false                        |
| templateMinifierOptions? | {options?: HtmlnanoOptions; preset?: HtmlnanoPreset}            | Options that would be passed to **htmlnano** (see more) [htmlnano doc](https://htmlnano.netlify.app/)                                                             | undefined                   |

> **nodemailer-mjml** bring 4 new params to the `sendMail` function

| options              | type   | description                                                                                                                                 | default   |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| templateName?        | string | Name of the file relative to **templateFolder** (without extension) corresponding to your template                                          | undefined |
| templateLayoutName?  | string | Name of the file relative to **templateFolder** (without extension) corresponding to your template layout file                              | undefined |
| templateLayoutSlots? | Object | Object containing path of partial file relative to **templateFolder** (without extension) that will be injected to the corresponding slot   | undefined |
| templateData?        | Object | Object containing data that would be used by mustache template compiler                                                                     | undefined |

## Tests

> This plugin, have multiple tests suites (unit, integration) to ensure that everything is working as expected
> You can run the tests locally by running the following command

```sh
# watch mode
docker compose run --rm tests pnpm test:watch
# single run
docker compose run --rm tests pnpm test
```

## Credit

This software uses the following open source packages:

- [MJML](https://github.com/mjmlio/)
- [nodemailer](https://github.com/nodemailer/nodemailer)
- [mustache](https://www.npmjs.com/package/mustache)
- [htmlnano](https://www.npmjs.com/package/htmlnano)

## Releasing

Publishing happens in CI when a `v*` tag is pushed.
The `Publish Package` workflow uses npm trusted publishing, so there is no npm token to manage.

1. Bump `version` in `package.json` in the PR that ships the change (`pnpm version <major|minor|patch> --no-git-tag-version`).
   Breaking changes to the plugin options or rendered output are a major bump.
2. Merge the PR into `master`.
3. Tag the merge commit with a signed tag and push it:

   ```sh
   git switch master && git pull
   git tag -s v3.0.0 -m v3.0.0
   git push origin v3.0.0
   ```

4. Once the workflow is green, create the GitHub release with notes: `gh release create v3.0.0 --generate-notes`.

## Syncing with upstream

```sh
git remote add upstream https://github.com/Thomascogez/nodemailer-mjml.git
git fetch upstream
git switch -c sync-upstream origin/master
git merge upstream/master
```

When resolving conflicts, keep our `name`, `version`, `repository` and `packageManager` in `package.json`.
Delete any `yarn.lock` or `package-lock.json` changes upstream brings in and run `pnpm install` to update `pnpm-lock.yaml`.
Upstream bumps its own version with every release, so check the upstream commits for breaking changes and pick our next version from those.

## Contributing

All contributions are welcome 🫡
