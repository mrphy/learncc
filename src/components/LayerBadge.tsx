import { cn } from '@/lib/cn'
import { LAYERS } from '@/lib/constants'
import type { Layer } from '@/lib/constants'

interface LayerBadgeProps {
  layer: Layer
  className?: string
}

export default function LayerBadge({ layer, className }: LayerBadgeProps) {
  return (
    <span className={cn(`layer-${layer}`, 'layer-badge', className)}>
      {LAYERS[layer].label}
    </span>
  )
}
