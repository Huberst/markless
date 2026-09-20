export const styles = (styleProps: Partial<CSSStyleDeclaration>): string => {
  const tempDiv = document.createElement('div')
  Object.assign(tempDiv.style, styleProps)
  return tempDiv.style.cssText
}
