/* eslint-disable implicit-arrow-linebreak, no-extra-parens, no-use-before-define, prefer-object-spread */
import idForComponent from "./inputs/id-for-component.js"
import nameForComponent from "./inputs/name-for-component.js"
import strftime from "strftime"
import useShape from "set-state-compare/build/use-shape.js"
import useValidationErrors from "./use-validation-errors.js"
import {dig, digg} from "diggerize"
import {useCallback, useEffect, useMemo, useRef} from "react"
import {useForm} from "./form"

