# 選情統計資料更新

`page2` 的六都議員席次、投票分析及歷史版圖會在瀏覽器載入時、每 30 秒，以及切回分頁時重新抓取資料。背景分頁暫停更新；抓取失敗保留上次成功的資料。年份、縣市選取值仍有效時會保留。

正式 build、`npm run preview` 及部署後，瀏覽器直接讀取 `https://doqvf81n9htmm.cloudfront.net/files/2026election/uat/` 下的 `getParliamentaryHistory`、`getElectionStat`、`getMayorHistory`。CDN 需維持 `Access-Control-Allow-Origin: *`，不需部署主機另設 API 轉送。本機 `npm run dev` 仍由 Vite proxy 轉送。請求附加時間戳並停用快取，避免沿用舊資料。

這次程式修改需建置、部署一次；後續只修改 API 資料時不需重新建置。建置時仍抓取資料，作為首屏與連線失敗時的備援。

驗證：`node --test tests/*.test.js`、`npm run build`。

# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
