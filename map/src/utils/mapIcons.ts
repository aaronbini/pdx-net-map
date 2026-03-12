import type { Map as MaplibreMap } from 'maplibre-gl'

const LOGICAL_SIZE = 22  // display size in logical (CSS) pixels
const PIXEL_RATIO = 2    // render 2× for retina sharpness

/**
 * Injects a fill color and white border stroke directly into the SVG markup,
 * then sets explicit pixel dimensions so the browser scales the viewBox correctly.
 */
function prepareSvg(svgString: string, px: number, color: string): string {
  return svgString
    .replace(/\s+width="[^"]*"/, '')
    .replace(/\s+height="[^"]*"/, '')
    .replace(
      /<svg/,
      `<svg width="${px}" height="${px}" fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round" paint-order="stroke fill"`
    )
}

function svgToImageData(svgString: string): Promise<ImageData> {
  const px = LOGICAL_SIZE * PIXEL_RATIO
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image(px, px)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = px
      canvas.height = px
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, px, px)
      URL.revokeObjectURL(url)
      resolve(ctx.getImageData(0, 0, px, px))
    }
    img.onerror = reject
    img.src = url
  })
}

export async function loadMapIcons(
  map: MaplibreMap,
  icons: Record<string, { svg: string; color: string }>
): Promise<void> {
  const px = LOGICAL_SIZE * PIXEL_RATIO
  await Promise.all(
    Object.entries(icons).map(async ([name, { svg, color }]) => {
      if (map.hasImage(name)) return
      const imageData = await svgToImageData(prepareSvg(svg, px, color))
      map.addImage(name, imageData, { pixelRatio: PIXEL_RATIO })
    })
  )
}
