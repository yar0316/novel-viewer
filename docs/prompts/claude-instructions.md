npm test -- NovelDetail.test.tsx

> frontend@0.1.0 test
> jest NovelDetail.test.tsx

 FAIL  src/components/NovelDetail.test.tsx
  NovelDetail
    √ 小説のタイトルが表示される (49 ms)
    × 作者名が表示される (11 ms)
    √ 小説の概要が表示される (5 ms)
    √ 最終更新日が表示される (5 ms)
    √ 話数が表示される (5 ms)
    √ 話一覧セクションが表示される (4 ms)
    √ トップページへの戻りリンクが表示される (5 ms)
    √ 話がない場合の表示 (3 ms)
    √ 作者が設定されていない場合は作者情報が表示されない (5 ms)
    √ 概要が設定されていない場合は概要が表示されない (5 ms)

  ● NovelDetail › 作者名が表示される

    TestingLibraryElementError: Unable to find an element with the text: /作者: テスト作者/. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    <body>
      <div>
        <div
          class="max-w-4xl mx-auto space-y-8"
        >
          <div
            class="mb-6"
          >
            <a
              class="text-primary hover:text-primary/80 text-sm transition-colors"
              href="/"
            >
              ← トップページに戻る
            </a>
          </div>
          <section
            class="space-y-4"
          >
            <h1
              class="text-3xl font-bold text-gray-900"
            >
              テスト小説
            </h1>
            <p
              class="text-gray-600"
            >
              作者:
              <span
                class="font-medium"
              >
                テスト作者
              </span>
            </p>
            <div
              class="prose max-w-none"
            >
              <p
                class="text-gray-700 leading-relaxed whitespace-pre-wrap"
              >
                これはテスト用の小説概要です。
              </p>
            </div>
            <div
              class="flex flex-wrap gap-4 text-sm text-gray-500"
            >
              <span>
                最終更新:
                2025/7/10
              </span>
              <span>
                全
                2
                話
              </span>
            </div>
          </section>
          <section
            class="space-y-4"
          >
            <h2
              class="text-2xl font-semibold text-gray-900"
            >
              話一覧
            </h2>
            <div
              class="space-y-2"
            >
              <a
                class="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                href="/novel/1/episode/ep1"
              >
                <div
                  class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div
                    class="flex-1"
                  >
                    <h3
                      class="font-medium text-gray-900 hover:text-primary transition-colors"
                    >
                      第
                      1
                      話:
                      第一話のタイトル
                    </h3>
                  </div>
                  <div
                    class="text-sm text-gray-500"
                  >
                    投稿日:
                    2025/6/1
                  </div>
                </div>
              </a>
              <a
                class="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                href="/novel/1/episode/ep2"
              >
                <div
                  class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div
                    class="flex-1"
                  >
                    <h3
                      class="font-medium text-gray-900 hover:text-primary transition-colors"
                    >
                      第
                      2
                      話:
                      第二話のタイトル
                    </h3>
                  </div>
                  <div
                    class="text-sm text-gray-500"
                  >
                    投稿日:
                    2025/6/8
                  </div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </body>

      61 |   test('作者名が表示される', () => {
      62 |     render(<NovelDetail novel={mockNovelWithEpisodes} />)
    > 63 |     expect(screen.getByText(/作者: テスト作者/)).toBeInTheDocument()
         |                   ^
      64 |   })
      65 |
      66 |   test('小説の概要が表示される', () => {

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at node_modules/@testing-library/dom/dist/query-helpers.js:95:19
      at Object.getByText (src/components/NovelDetail.test.tsx:63:19)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 9 passed, 10 total
Snapshots:   0 total
Time:        1.443 s
Ran all test suites matching NovelDetail.test.tsx.

テストの結果です。確認してください。
