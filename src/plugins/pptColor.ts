type StrOrNum = string | number

export class Rgb {
  r: StrOrNum
  g: StrOrNum
  b: StrOrNum

  constructor (color: [(StrOrNum), (StrOrNum), (StrOrNum)]) {
    this.r = color[0]
    this.g = color[1]
    this.b = color[2]
  }

  set rgb(color: [(StrOrNum), (StrOrNum), (StrOrNum)]) {
    this.r = color[0]
    this.g = color[1]
    this.b = color[2]
  }

  toString(): string {
    return `rgb(${this.r},${this.g},${this.b})`
  }
}

export class Rgba extends Rgb {
  a: StrOrNum

  constructor (color: [(StrOrNum), (StrOrNum), (StrOrNum), (StrOrNum)]) {
    super([color[0], color[1], color[2]])
    this.a = color[3]
  }

  set rgba(color: [(StrOrNum), (StrOrNum), (StrOrNum), (StrOrNum)]) {
    this.r = color[0]
    this.g = color[1]
    this.b = color[2]
    this.a = color[3]
  }

  toString(): string {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`
  }
}

export class Hsl {
  h: StrOrNum
  s: StrOrNum
  l: StrOrNum

 
  constructor (color: [(StrOrNum), (StrOrNum), (StrOrNum)]) {
    this.h = color[0]
    this.s = color[1]
    this.l = color[2]
  }

  set hsl(color: [(StrOrNum), (StrOrNum), (StrOrNum)]) {
    this.h = color[0]
    this.s = color[1]
    this.l = color[2]
  }

  toString(): string {
    return `hsl(${this.h},${this.s}%,${this.l}%)`
  }
}

export class Hsla extends Hsl {
  a: StrOrNum

   constructor (color: [(StrOrNum), (StrOrNum), (StrOrNum), (StrOrNum)]) {
    super([color[0], color[1], color[2]])
    this.a = color[3]
  }

  set hsla(color: [(StrOrNum), (StrOrNum), (StrOrNum), (StrOrNum)]) {
    this.h = color[0]
    this.s = color[1]
    this.l = color[2]
    this.a = color[3]
  }

  toString(): string {
    return `hsla(${this.h},${this.s}%,${this.l}%,${this.a})`
  }
}

export class Color { 
  r: StrOrNum | (StrOrNum)[]
  g: StrOrNum
  b: StrOrNum
  a: StrOrNum
  rgb: Rgb
  rgba: Rgba
  hex: string
  hsl: Hsl
  hsla: Hsla
  h: StrOrNum
  s: StrOrNum
  l: StrOrNum

  constructor(r: StrOrNum | (StrOrNum)[], g?: (StrOrNum), b?: (StrOrNum), a: (StrOrNum) = 1.0) { 
    if (typeof r === 'string') {
      let str = r
      if (str.charAt(0) !== '#') {
        str = '#' + str
      }
      if (str.length < 7) {
        str = '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]
      }
      ([r, g, b] = hexToRgb(str))
    } else if (r instanceof Array) {
      a = r[3] || a
      b = r[2]
      g = r[1]
      r = r[0]
    }
    this.r = r
    this.g = g as StrOrNum
    this.b = b as StrOrNum
    this.a = a

    this.rgb = new Rgb([this.r as string, this.g, this.b])
    this.rgba = new Rgba([this.r as string, this.g, this.b, this.a as string])
    this.hex = rgbToHex(this.r, this.g, this.b)

    this.hsl = new Hsl(rgbToHsl(this.r, this.g, this.b))
    this.h = this.hsl.h
    this.s = this.hsl.s
    this.l = this.hsl.l
    this.hsla = new Hsla([this.h, this.s, this.l, this.a])
  }

  setHue (newHue: StrOrNum) {
    this.h = newHue
    this.hsl.h = newHue
    this.hsla.h = newHue
    this.updateFromHsl()
  }

  setSat (newSat: StrOrNum) {
    this.s = newSat
    this.hsl.s = newSat
    this.hsla.s = newSat
    this.updateFromHsl()
  }

  setLum (newLum: StrOrNum) {
    this.l = newLum
    this.hsl.l = newLum
    this.hsla.l = newLum
    this.updateFromHsl()
  }

  setAlpha (newAlpha: StrOrNum) {
    this.a = newAlpha
    this.hsla.a = newAlpha
    this.rgba.a = newAlpha
  }

  updateFromHsl () {
    this.rgb = new Rgb(hslToRgb(this.h, this.s, this.l))
    this.r = this.rgb.r
    this.g = this.rgb.g
    this.b = this.rgb.b
    this.rgba.r = this.rgb.r
    this.rgba.g = this.rgb.g
    this.rgba.b = this.rgb.b

    this.hex = rgbToHex([this.r, this.g, this.b])
  }
}

export const hslToRgb = (h: StrOrNum | (StrOrNum)[], s: (StrOrNum), l: (StrOrNum)): [(StrOrNum), (StrOrNum), (StrOrNum)] => {
  if (h instanceof Array) {
    l = h[2]
    s = h[1]
    h = h[0]
  }
  h = Number(h) / 360
  s = Number(s) / 100
  l = Number(l) / 100
  let r: number, g: number, b: number, q: number, p: number
  if (s === 0) {
    r = g = b = l
  } else {
    q = l < 0.5 ? l * (1 + s) : l + s - l * s
    p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export const hue2rgb = (p: number, q: number, t: number): number => {
  if (t < 0) { t += 1 }
  if (t > 1) { t -= 1 }
  if (t < 1 / 6) { return p + (q - p) * 6 * t }
  if (t < 1 / 2) { return q }
  if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6 }
  return p
}

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [ parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16) ] : null
}

export const componentToHex = (c: StrOrNum) => {
  const hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

export const rgbToHex = (r: StrOrNum | (StrOrNum)[], g?: (StrOrNum), b?: (StrOrNum)): string => {
  if (r instanceof Array) {
    b = r[2]
    g = r[1]
    r = r[0]
  }
  return '#' + componentToHex(r) + componentToHex(g as StrOrNum) + componentToHex(b as StrOrNum)
}

export const rgbToHsl = (r: StrOrNum | (StrOrNum)[], g?: (StrOrNum), b?: (StrOrNum)): [(StrOrNum), (StrOrNum), (StrOrNum)] => {
  if (r instanceof Array) {
    b = r[2]
    g = r[1]
    r = r[0]
  }
  let h: number | undefined, s: number, l: number, d: number, max: number, min: number
  r = Number(r) / 255
  g = Number(g) / 255
  b = Number(b) / 255
  max = Math.max(r, g, b)
  min = Math.min(r, g, b)
  l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h = Number(h as number) / 6
  }
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)
  return [h, s, l]
}

export const randomColor = () => {
  const r = '#' + Math.random().toString(16).slice(2, 8)
  return new Color(r)
}

export class ColorScheme { 
  palette: Color[]

  constructor (colorVal: string | string[], angleArray?: number[]) {
    this.palette = []

    if (angleArray === undefined && colorVal instanceof Array) {
      this.createFromColors(colorVal)
    } else {
      this.createFromAngles(colorVal as string, angleArray!)
    }
  }

  private createFromColors(colorVal: string[]): Color[] {
    for (const color of colorVal) {
      this.palette.push(new Color(color));
    }
    return this.palette;
  }

  private createFromAngles(colorVal: string, angleArray: number[]): Color[] {
    this.palette.push(new Color(colorVal))
    for (const angle of angleArray) {
      const tempHue = ((this.palette[0].h as number) + angle) % 360
      this.palette.push(new Color(hslToRgb(tempHue, this.palette[0].s, this.palette[0].l)))
    }
    return this.palette
  }

  static Compl(colorVal: string): ColorScheme {
    return new this(colorVal, [180])
  }

  static Triad(colorVal: string): ColorScheme {
    return new this(colorVal, [120, 240])
  }

  static Tetrad(colorVal: string): ColorScheme {
    return new this(colorVal, [60, 180, 240])
  }

  static Analog(colorVal: string): ColorScheme {
    return new this(colorVal, [-45, 45])
  }

  static Split(colorVal: string): ColorScheme {
    return new this(colorVal, [150, 210])
  }

  static Accent(colorVal: string): ColorScheme {
    return new this(colorVal, [-45, 45, 180])
  }
}
