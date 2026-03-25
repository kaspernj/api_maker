import "react-native"

declare module "react-native" {
  interface ViewProps {
    className?: string
    dataSet?: Record<string, string | number | boolean | undefined>
  }

  interface PressableProps {
    dataSet?: Record<string, string | number | boolean | undefined>
  }

  interface TextInputProps {
    dataSet?: Record<string, string | number | boolean | undefined>
  }

}
