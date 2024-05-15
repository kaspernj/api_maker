import useBreakpoint from "./use-breakpoint"

export default (WrappedComponent) => (props) => {
  const {breakpoint} = useBreakpoint()

  return (
    <WrappedComponent breakPoint={breakpoint} {...props} />
  )
}
