// @ts-check
import SourceMapsLoader from "../build/source-maps-loader"

describe("SourceMapsLoader", () => {
  test("it resolves source maps from stack frames that include a method prefix", () => {
    const loader = new SourceMapsLoader()

    expect(loader.getMapURL({
      src: "webpackAsyncContext@http://127.0.0.1:35351/packs/js/react.js"
    })).toEqual("http://127.0.0.1:35351/packs/js/react.js.map")
  })

  test("it matches loaded source maps against normalized stack frame files", () => {
    const loader = new SourceMapsLoader()

    loader.sourceMaps = [
      {
        originalUrl: "http://127.0.0.1:35351/packs/js/react.js",
        consumer: {
          originalPositionFor() {
            return {
              source: "webpack://app/app/javascript/shared/react-app.jsx",
              line: 12,
              column: 7
            }
          }
        }
      }
    ]

    expect(loader.getStackTraceData("webpackAsyncContext@http://127.0.0.1:35351/packs/js/react.js:615:7")).toEqual([
      {
        filePath: "app/javascript/shared/react-app.jsx",
        fileString: "app/javascript/shared/react-app.jsx:12:7",
        methodName: "webpackAsyncContext"
      }
    ])
  })

  test("it keeps every frame in the newer paren style that a regex-set parser drops", () => {
    const loader = new SourceMapsLoader()

    const stack = [
      "Error: something",
      "fn (http://127.0.0.1:35351/packs/js/0.chunk.js:2:73779)",
      "at async r (http://127.0.0.1:35351/packs/js/user-steps/edit.chunk.js:1:555)",
      "fn@http://127.0.0.1:35351/packs/js/other.chunk.js:9:10"
    ].join("\n")

    expect(loader.getStackTraceData(stack)).toEqual([
      {
        filePath: "http://127.0.0.1:35351/packs/js/0.chunk.js",
        fileString: "http://127.0.0.1:35351/packs/js/0.chunk.js:2:73779",
        methodName: "fn"
      },
      {
        filePath: "http://127.0.0.1:35351/packs/js/user-steps/edit.chunk.js",
        fileString: "http://127.0.0.1:35351/packs/js/user-steps/edit.chunk.js:1:555",
        methodName: "async r"
      },
      {
        filePath: "http://127.0.0.1:35351/packs/js/other.chunk.js",
        fileString: "http://127.0.0.1:35351/packs/js/other.chunk.js:9:10",
        methodName: "fn"
      }
    ])
  })

  test("it looks up source maps for frames in the newer paren style", () => {
    const loader = new SourceMapsLoader()
    const error = new Error("x")

    error.stack = "Error: x\nfn (http://127.0.0.1:35351/packs/js/0.chunk.js:2:73779)"

    expect(loader.getSourcesFromError(error)).toEqual([
      {
        originalUrl: "http://127.0.0.1:35351/packs/js/0.chunk.js",
        sourceMapUrl: "http://127.0.0.1:35351/packs/js/0.chunk.js.map"
      }
    ])
  })
})
