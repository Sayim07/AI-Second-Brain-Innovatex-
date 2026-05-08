'use client'

import { Suspense, lazy, useEffect, useRef } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

export function SplineScene({ scene, className }) {
  const appRef = useRef(null)
  const headRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ y: 0, x: 0 })
  const currentRef = useRef({ y: 0, x: 0 })
  const baseRef = useRef({ y: 0, x: 0 })

  useEffect(() => {
    let rafId = 0

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth - 0.5
      mouseRef.current.y = e.clientY / window.innerHeight - 0.5
    }

    const tick = () => {
      const head = headRef.current
      if (head && head.rotation) {
        // Only rotate head subtly; body animation remains untouched.
        targetRef.current.y = baseRef.current.y + mouseRef.current.x * 0.5
        targetRef.current.x = baseRef.current.x + mouseRef.current.y * 0.2

        currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08
        currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08

        head.rotation.y = currentRef.current.y
        head.rotation.x = currentRef.current.x
      }

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const handleLoad = (splineApp) => {
    appRef.current = splineApp

    const candidateNames = [
      'Head',
      'head',
      'RobotHead',
      'Robot_Head',
      'Character_Head',
      'Neck',
    ]

    for (const name of candidateNames) {
      const obj = splineApp.findObjectByName(name)
      if (obj) {
        headRef.current = obj
        baseRef.current = {
          y: obj.rotation?.y ?? 0,
          x: obj.rotation?.x ?? 0,
        }
        currentRef.current = { ...baseRef.current }
        targetRef.current = { ...baseRef.current }
        break
      }
    }

    if (!headRef.current) {
      const queue = [...(splineApp?._scene?.children || [])]
      while (queue.length > 0) {
        const node = queue.shift()
        if (!node) continue

        if (typeof node.name === 'string' && /(head|face|neck)/i.test(node.name)) {
          headRef.current = node
          baseRef.current = {
            y: node.rotation?.y ?? 0,
            x: node.rotation?.x ?? 0,
          }
          currentRef.current = { ...baseRef.current }
          targetRef.current = { ...baseRef.current }
          break
        }

        if (Array.isArray(node.children) && node.children.length > 0) {
          queue.push(...node.children)
        }
      }
    }
  }

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
          <div className="text-slate-300 text-sm">Loading 3D scene...</div>
        </div>
      }
    >
      <Spline scene={scene} className={className} onLoad={handleLoad} />
    </Suspense>
  )
}
