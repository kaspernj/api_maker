// @ts-check

/**
 * @callback AnimateDraggedColumn
 * @param {object} animatedPosition
 * @param {object} animationArgs
 * @returns {{start: () => void}}
 */

/**
 * @typedef {{setValue(value: {x?: number, y?: number}): void}} AnimatedPositionLike
 */

/**
 * @typedef {object} MoveDraggedColumnPositionArgs
 * @property {object} item
 * @property {object} [animationArgs]
 * @property {AnimateDraggedColumn} [timing]
 * @property {number} [x]
 * @property {number} [y]
 */

/**
 * Move the dragged table column using the item's current animated position.
 * @param {MoveDraggedColumnPositionArgs} args
 * @returns {void}
 */
export default function moveDraggedColumnPosition({animationArgs, item, timing, x, y}) {
  const {animatedPosition} = /** @type {{animatedPosition?: AnimatedPositionLike}} */ (item)

  if (!animatedPosition) throw new Error("Expected dragged table column to have an animated position")

  if (animationArgs) {
    if (!timing) throw new Error("Expected a timing animation function")

    timing(animatedPosition, animationArgs).start()
  } else {
    animatedPosition.setValue({x, y})
  }
}
