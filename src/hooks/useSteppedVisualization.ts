'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseSteppedVisualizationOptions {
  totalSteps: number
  autoPlayInterval?: number
}

export function useSteppedVisualization({
  totalSteps,
  autoPlayInterval = 2500,
}: UseSteppedVisualizationOptions) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const next = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }, [totalSteps])

  const prev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)))
    },
    [totalSteps]
  )

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, autoPlayInterval)

    return () => clearInterval(timer)
  }, [isPlaying, totalSteps, autoPlayInterval])

  return {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    goToStep,
    isPlaying,
    toggleAutoPlay,
  }
}
