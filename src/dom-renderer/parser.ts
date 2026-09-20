import { isReactiveAdapter } from '../reactive-adapters.ts'
import { ElDescription, type TCanBeRendered } from '../static-el-base.ts'
import { CommentRenderer } from './comment-renderer.ts'
import { ComponentRenderer } from './component-renderer.ts'
import type { DomRenderCtx, IRenderer } from './dom-renderer.ts'
import { ElementRenderer } from './element-renderer.ts'
import { TextRenderer } from './text-renderer.ts'

/**
 * Function to iterate over an array of renderable elements to reduce them
 * to a set of ElRenderer, TextRenderer and CompRenderer entries.
 * Those can later be mounted to the DOM.
 * @param rElements Elements that can be rendered TCanBeRendered
 * @returns Array which contains only ElRenderer or CompRenderer entires.
 */
export function parse(
  rElements: TCanBeRendered[],
  renderCtx: DomRenderCtx,
): IRenderer[] {
  const prepared: IRenderer[] = []
  rElements.forEach((item) => {
    if (Array.isArray(item)) {
      const nestedRenderers = parse(item, renderCtx)
      prepared.push(...nestedRenderers)
      return
    }
    if (typeof item === 'string' || typeof item === 'number') {
      const textElR = new TextRenderer(item)
      textElR.create(renderCtx)
      prepared.push(textElR)
      return
    }
    if (typeof item === 'function') {
      const compR = new ComponentRenderer('from parse')
      compR.setTmpl(item(renderCtx))
      compR.create(renderCtx)
      prepared.push(compR)
      return
    }
    if (item instanceof ElDescription) {
      if (item.elName === 'comment') {
        const commentR = new CommentRenderer(item)
        commentR.create(renderCtx)
        prepared.push(commentR)
      } else {
        const elR = new ElementRenderer(item)
        elR.create(renderCtx)
        prepared.push(elR)
      }
      return
    }
    if (isReactiveAdapter(item)) {
      const obsTextR = new TextRenderer(item)
      obsTextR.create(renderCtx)
      prepared.push(obsTextR)
      return
    }
    /**
     * @TODO this could be opt in. Would also be nice if users can add their own renderers
     * and therefore expand the 'template'-language.
     */
  })
  return prepared
}
