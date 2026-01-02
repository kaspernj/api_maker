export default useInput;
/**
 * @param {object} args
 * @param {object} args.props
 * @param {object} args.props.inputRef
 * @param {string} args.props.type
 * @param {object} args.props.inputProps
 * @param {string} args.props.inputProps.name
 * @param {object} args.props.inputProps.wrapperOpts
 * @param {object} args.wrapperOptions
 * @param {string} args.wrapperOptions.type
 * @returns {{inputProps: object, wrapperOpts: object, restProps: object}}
 */
declare function useInput({ props, wrapperOptions, ...useInputRestProps }: {
    props: {
        inputRef: object;
        type: string;
        inputProps: {
            name: string;
            wrapperOpts: object;
        };
    };
    wrapperOptions: {
        type: string;
    };
}): {
    inputProps: object;
    wrapperOpts: object;
    restProps: object;
};
//# sourceMappingURL=use-input.d.ts.map