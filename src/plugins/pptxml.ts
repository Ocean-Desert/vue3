let _order = 1

export interface NodeAttributes {
  [key: string]: string | { [key: string]: any }
}

export interface ParsedNode {
  children?: (ParsedNode | string)[]
  tagName: string
  attrs: NodeAttributes
}

export interface SimplifiedNode {
  [key: string]: SimplifiedNode | SimplifiedNode[] | string | { [key: string]: any }
}

export default (text: string): SimplifiedNode => {
  const openBracket = '<'
  const openBracketCC = '<'.charCodeAt(0)
  const closeBracket = '>'
  const closeBracketCC = '>'.charCodeAt(0)
  const minusCC = '-'.charCodeAt(0)
  const slashCC = '/'.charCodeAt(0)
  const exclamationCC = '!'.charCodeAt(0)
  const singleQuoteCC = '\''.charCodeAt(0)
  const doubleQuoteCC = '"'.charCodeAt(0)
  const questionMarkCC = '?'.charCodeAt(0)

  const nameSpacer = '\r\n\t>/= '

  let pos = 0

  const parseChildren = (): (ParsedNode | string)[] => {
    const children: (ParsedNode | string)[] = []
    while (text[pos]) {
      if (text.charCodeAt(pos) === openBracketCC) {
        if (text.charCodeAt(pos + 1) === slashCC) {
          pos = text.indexOf(closeBracket, pos)
          return children
        } else if (text.charCodeAt(pos + 1) === exclamationCC) {
          if (text.charCodeAt(pos + 2) === minusCC) {
            // comment support
            while (!(text.charCodeAt(pos) === closeBracketCC && text.charCodeAt(pos - 1) === minusCC && text.charCodeAt(pos - 2) === minusCC && pos !== -1)) {
              pos = text.indexOf(closeBracket, pos + 1)
            }
            if (pos === -1) {
              pos = text.length
            }
          } else {
            // doctype support
            pos += 2
            for (; text.charCodeAt(pos) !== closeBracketCC; pos++) {}
          }
          pos++
          continue
        } else if (text.charCodeAt(pos + 1) === questionMarkCC) { // <?
          // XML header support
          pos = text.indexOf(closeBracket, pos)
          pos++
          continue
        }
        pos++
        let startNamePos = pos
        for (; nameSpacer.indexOf(text[pos]) === -1; pos++) {}
        const nodeTagName = text.slice(startNamePos, pos)

        let attrFound = false
        let nodeAttributes: NodeAttributes = {}
        for (; text.charCodeAt(pos) !== closeBracketCC; pos++) {
          const c = text.charCodeAt(pos)
          if ((c > 64 && c < 91) || (c > 96 && c < 123)) {
            startNamePos = pos
            for (; nameSpacer.indexOf(text[pos]) === -1; pos++) {}
            const name = text.slice(startNamePos, pos)
            // search beginning of the string
            let code = text.charCodeAt(pos)
            while (code !== singleQuoteCC && code !== doubleQuoteCC) {
              pos++
              code = text.charCodeAt(pos)
            }

            const startChar = text[pos]
            const startStringPos = ++pos
            pos = text.indexOf(startChar, startStringPos)
            const value = text.slice(startStringPos, pos)
            if (!attrFound) {
              nodeAttributes = {}
              attrFound = true
            }
            nodeAttributes[name] = value
          }
        }

        let nodeChildren: (ParsedNode | string)[] = []
        if (text.charCodeAt(pos - 1) !== slashCC) {
          pos++
          nodeChildren = parseChildren()
        }

        children.push({
          children: nodeChildren,
          tagName: nodeTagName,
          attrs: nodeAttributes
        })
      } else {
        const startTextPos = pos
        pos = text.indexOf(openBracket, pos) - 1
        if (pos === -2) {
          pos = text.length
        }
        const str = text.slice(startTextPos, pos + 1)
        if (str.trim().length > 0) {
          children.push(str)
        }
      }
      pos++
    }
    return children
  }
  _order = 1
  return simplefy(parseChildren())
}

const simplefy = (children: (ParsedNode | string)[]): SimplifiedNode => {
  const node: SimplifiedNode = {}
  if (children === undefined) {
    return {}
  }
  if (children.length === 1 && (typeof children[0] === 'string' || children[0] instanceof String)) {
    return new String(children[0]) as unknown as SimplifiedNode
  }
  children.forEach((child: ParsedNode | string) => {
    if (!node[(child as ParsedNode).tagName]) {
      node[(child as ParsedNode).tagName] = []
    }
    if (typeof child === 'object') {
      const kids = simplefy(child.children as (ParsedNode | string)[])
      if (child.attrs) {
        kids.attrs = child.attrs
      }
      if (kids['attrs'] === undefined) {
        kids['attrs'] = {'order': _order}
      } else {
        kids['attrs']['order'] = _order
      }
      _order++;
      (node[child.tagName] as SimplifiedNode[]).push(kids)
    }
  })
  for (let i in node) {
    if (node[i].length === 1) {
      node[i] = node[i][0]
    }
  }
  return node
}

