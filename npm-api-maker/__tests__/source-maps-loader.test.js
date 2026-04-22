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
        methodName: "<unknown>"
      }
    ])
  })
})
