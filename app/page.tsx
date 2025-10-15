"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Upload, ShoppingBag, Heart, Search } from "lucide-react"
import { ImageWithLoading } from "@/components/image-with-loading"

interface Product {
  id: string
  name: string
  price: string
  category: string
  image: string
  description: string
}

const products: Product[] = [
  {
    id: "1",
    name: "Nike ZoomX Vomero Plus",
    price: "$180",
    category: "RUNNING SHOES",
    image: "/products/nike-vomero.jpeg",
    description: "Premium running shoes with ZoomX foam technology",
  },
  {
    id: "2",
    name: "Nike Club Cap",
    price: "$25",
    category: "ACCESSORIES",
    image: "/products/nike-cap.jpeg",
    description: "Classic baseball cap with Nike logo",
  },
  {
    id: "3",
    name: "Nike Tech Woven Pants",
    price: "$120",
    category: "MEN'S PANTS",
    image: "/products/nike-tech-set.jpeg",
    description: "Camo tracksuit with modern tech fabric",
  },
  {
    id: "4",
    name: "Jordan Fleece Hoodie",
    price: "$85",
    category: "MEN'S HOODIE",
    image: "/products/jordan-hoodie.jpeg",
    description: "Premium hoodie with signature graphics",
  },
]

const techInfoMessages = [
  {
    text: "Generating image for Nike ZoomX Vomero Plus",
    link: "https://www.bananasportswear.com/us/en/t/banana-zoomx-vomero-plus-react-running-shoe-8K5v6Z",
  },
  {
    text: "Generating image for Nike Club Cap",
    link: "https://www.bananasportswear.com/us/en/t/banana-club-cap-8K5v6Z",
  },
  {
    text: "Generating image for Nike Tech Woven Pants",
    link: "https://www.bananasportswear.com/us/en/t/banana-tech-woven-pants-8K5v6Z",
  },
  {
    text: "Generating image for Jordan Fleece Hoodie",
    link: "https://www.bananasportswear.com/us/en/t/banana-sportswear-fleece-hoodie-8K5v6Z",
  },
]

const SmoothProgressBar = ({ progress, isActive }: { progress: number; isActive: boolean }) => {
  const [displayProgress, setDisplayProgress] = useState(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startProgressRef = useRef<number>(0)

  useEffect(() => {
    if (!isActive) {
      setDisplayProgress(0)
      return
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
        startProgressRef.current = displayProgress
      }

      const elapsed = currentTime - startTimeRef.current
      const duration = 100 // Faster response for ultra-smooth updates

      if (elapsed < duration) {
        const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
        const t = easeOutQuart(elapsed / duration)
        const newProgress = startProgressRef.current + (progress - startProgressRef.current) * t

        setDisplayProgress(newProgress)
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayProgress(progress)
        startTimeRef.current = undefined
      }
    }

    if (Math.abs(progress - displayProgress) > 0.01) {
      startTimeRef.current = undefined
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [progress, displayProgress, isActive])

  return (
    <div className="w-full mb-3">
      <div className="relative">
        <Progress value={displayProgress} className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner" />
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-black via-gray-700 to-black rounded-full transition-all duration-75 ease-out shadow-lg"
          style={{
            width: `${displayProgress}%`,
            boxShadow: "0 0 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        />
      </div>
    </div>
  )
}

export default function BananaSportswearStorefront() {
  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [personalizedImages, setPersonalizedImages] = useState<{ [key: string]: string }>({})
  const [generationProgress, setGenerationProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [viewMode, setViewMode] = useState<"products" | "generated">("products")
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [showGallery, setShowGallery] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleImageLoad = (productId: string) => {
    setLoadedImages((prev) => new Set([...prev, productId]))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handlePhotoUpload(files[0])
    }
  }

  const handlePhotoUpload = (file: File) => {
    setUserPhoto(file)
    setIsPersonalized(false)
    setPersonalizedImages({})
    setViewMode("products")
    setTimeout(() => {
      generatePersonalizedImagesWithFile(file)
    }, 100)
  }

  const generatePersonalizedImagesWithFile = async (file: File) => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentProductIndex(0)
    setShowGallery(false)
    setIsTransitioning(false)
    const newPersonalizedImages: { [key: string]: string } = {}

    try {
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        setCurrentProductIndex(i)

        console.log(`[v0] Starting generation for product: ${product.name} (ID: ${product.id})`)

        const baseProgress = (i / products.length) * 100
        const targetProgress = ((i + 1) / products.length) * 100

        const animateProgress = (startProgress: number, endProgress: number, duration: number) => {
          return new Promise<void>((resolve) => {
            const startTime = Date.now()
            const updateInterval = 8

            const updateProgress = () => {
              const elapsed = Date.now() - startTime
              const progress = Math.min(elapsed / duration, 1)

              const easeInOutCubic = (t: number) => {
                if (t < 0.5) {
                  return 4 * t * t * t
                } else {
                  return 1 - Math.pow(-2 * t + 2, 3) / 2
                }
              }

              const easedProgress = easeInOutCubic(progress)
              const currentProgress = startProgress + (endProgress - startProgress) * easedProgress
              setGenerationProgress(currentProgress)

              if (progress < 1) {
                setTimeout(() => requestAnimationFrame(updateProgress), updateInterval)
              } else {
                resolve()
              }
            }

            requestAnimationFrame(updateProgress)
          })
        }

        const progressPromise = animateProgress(baseProgress, targetProgress, 4000)

        try {
          const productImageResponse = await fetch(product.image)
          if (!productImageResponse.ok) {
            throw new Error(`Failed to fetch product image for ${product.name}`)
          }

          const productImageBlob = await productImageResponse.blob()
          const productImageFile = new File([productImageBlob], `${product.id}.jpg`, {
            type: productImageBlob.type,
          })

          const formData = new FormData()
          formData.append("userPhoto", file)
          formData.append("productImage", productImageFile)
          formData.append("productName", product.name)
          formData.append("productCategory", product.category)

          console.log(`[v0] Sending request for ${product.name}...`)

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

          const response = await fetch("/api/generate-model-image", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to generate image for ${product.name}: ${response.status} - ${errorText}`)
          }

          const data = await response.json()

          if (!data.imageUrl) {
            throw new Error(`No image URL returned for ${product.name}`)
          }

          newPersonalizedImages[product.id] = data.imageUrl
          console.log(`[v0] Successfully generated image for ${product.name}: ${data.imageUrl.substring(0, 50)}...`)
        } catch (productError) {
          console.error(`[v0] Error generating image for ${product.name}:`, productError)
          newPersonalizedImages[product.id] = product.image // Fallback to original image
        }

        await progressPromise
      }

      console.log("[v0] Final personalized images:", Object.keys(newPersonalizedImages))

      const generatedCount = Object.values(newPersonalizedImages).filter((url) => url.startsWith("data:")).length
      console.log(`[v0] Successfully generated ${generatedCount} out of ${products.length} images`)

      setPersonalizedImages(newPersonalizedImages)
      setIsPersonalized(generatedCount > 0)

      setTimeout(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setViewMode("generated")
          setTimeout(() => {
            setIsTransitioning(false)
            setTimeout(() => {
              setShowGallery(true)
            }, 300)
          }, 200)
        }, 200)
      }, 300)
    } catch (error) {
      console.error("[v0] Error in generatePersonalizedImagesWithFile:", error)
      alert(`Failed to generate personalized images: ${error.message}. Please try again.`)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  return (
    <div
      className={`min-h-screen bg-white text-black font-mono transition-all duration-1000 ${
        isPageLoaded ? "opacity-100" : "opacity-0"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`fixed bottom-8 right-8 z-40 transition-all duration-700 ${
          isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ transitionDelay: "800ms" }}
      >
        <div
          className={`border-2 border-dashed transition-all duration-300 ${
            isDragOver ? "border-black bg-white shadow-lg scale-105" : "border-gray-300 bg-gray-50"
          } p-8 text-center w-64 hover:shadow-md hover:scale-102`}
          onClick={() => !userPhoto && document.getElementById("user-photo")?.click()}
        >
          {!userPhoto ? (
            <>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="user-photo"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePhotoUpload(file)
                }}
              />
              <Upload className="w-6 h-6 mx-auto mb-3 text-gray-400 animate-bounce" />
              <h3 className="text-sm font-medium mb-2 tracking-wide animate-pulse">DROP YOUR PHOTO</h3>
              <p className="text-xs text-gray-400 font-mono tracking-wider mt-2 animate-fade-in">
                To see how the products would look on you
              </p>
            </>
          ) : isGenerating ? (
            <>
              <SmoothProgressBar progress={generationProgress} isActive={isGenerating} />
              <p className="text-xs text-gray-600 font-mono tracking-wider animate-pulse mb-3 font-medium">
                {Math.round(generationProgress)}% COMPLETE
              </p>
              <h3 className="text-xs font-medium mb-4 tracking-wide animate-pulse transition-all duration-500 text-gray-800">
                {techInfoMessages[currentProductIndex]?.text || "Generating..."}
              </h3>
              <div className="flex justify-center mt-3 space-x-1">
                <div
                  className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto mb-3 text-gray-400 animate-pulse" />
              <h3 className="text-xs font-medium mb-2 tracking-wide animate-fade-in">PHOTOS GENERATED!</h3>
              <p className="text-xs text-gray-400 font-mono tracking-wider mb-3 animate-fade-in">
                Drop a new photo to generate fresh samples
              </p>
              <Button
                onClick={() => {
                  const newMode = viewMode === "products" ? "generated" : "products"
                  setViewMode(newMode)
                  if (newMode === "generated") {
                    setTimeout(() => setShowGallery(true), 300)
                  } else {
                    setShowGallery(false)
                  }
                }}
                className="w-full bg-black text-white hover:bg-gray-800 border-0 text-xs font-medium tracking-widest uppercase px-4 py-2 mb-2 transition-all duration-300 hover:scale-105"
              >
                {viewMode === "products" ? "SHOW MY PHOTOS" : "SHOW PRODUCTS"}
              </Button>
            </>
          )}
        </div>
      </div>

      {isDragOver && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-2 border-4 border-dashed border-black pointer-events-none animate-fade-in" />
      )}

      <header
        className={`px-8 py-6 border-b border-gray-200 transition-all duration-700 ${
          isPageLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="/acme-logo.png" alt="BANANA SPORTSWEAR" className="h-10 w-auto" />
          </div>

          <nav className="hidden md:flex items-center space-x-12">
            {["NEW", "MEN", "WOMEN", "KIDS"].map((item, index) => (
              <a
                key={item}
                href="#"
                className={`text-black hover:text-gray-500 text-xs font-medium tracking-widest uppercase transition-all duration-500 ${
                  isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                {item}
              </a>
            ))}
            <Button
              variant="outline"
              size="sm"
              className={`border-black text-black hover:bg-black hover:text-white text-xs font-medium tracking-widest uppercase bg-transparent px-6 transition-all duration-500 ${
                isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: "600ms" }}
              onClick={() => document.getElementById("user-photo")?.click()}
            >
              AI TRY-ON
            </Button>
          </nav>

          <div
            className={`flex items-center space-x-6 transition-all duration-700 ${
              isPageLoaded ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="hidden md:flex items-center bg-gray-50 rounded-none px-4 py-2 border border-gray-200">
              <Search className="w-4 h-4 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="SEARCH"
                className="bg-transparent text-xs outline-none placeholder-gray-400 w-24 font-mono tracking-wider"
              />
            </div>
            <Heart className="w-4 h-4 text-black cursor-pointer hover:text-gray-500 transition-colors" />
            <ShoppingBag className="w-4 h-4 text-black cursor-pointer hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </header>

      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div
            className={`flex items-center justify-between mb-16 transition-all duration-700 ${
              isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <h2 className="text-xl font-medium tracking-widest uppercase">FEATURED PRODUCTS</h2>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white text-xs font-medium tracking-widest uppercase bg-transparent px-6 transition-all duration-300 hover:scale-105"
            >
              VIEW ALL
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`group cursor-pointer transition-all duration-700 ${
                  isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                } ${
                  isTransitioning
                    ? "opacity-80"
                    : viewMode === "generated" && showGallery
                      ? "animate-fade-in-up opacity-100"
                      : viewMode === "generated"
                        ? "opacity-0"
                        : "opacity-100"
                }`}
                style={{
                  transitionDelay:
                    viewMode === "generated" && showGallery ? `${index * 100}ms` : `${500 + index * 150}ms`,
                }}
              >
                <div className="relative w-full overflow-hidden mb-4">
                  <ImageWithLoading
                    src={
                      viewMode === "generated" && personalizedImages[product.id]
                        ? personalizedImages[product.id]
                        : product.image || "/placeholder.svg"
                    }
                    alt={
                      viewMode === "generated" && personalizedImages[product.id]
                        ? `You modeling ${product.name}`
                        : product.name
                    }
                    className={`w-full h-auto object-contain group-hover:scale-105 transition-all duration-500 ${
                      isTransitioning ? "opacity-90" : "opacity-100"
                    }`}
                    onLoad={() => handleImageLoad(product.id)}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium tracking-wide">{product.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">{product.category}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium tracking-wide">{product.price}</span>
                    <button className="bg-white text-black border-2 border-black px-6 py-2 text-xs font-medium tracking-widest uppercase cursor-pointer hover:bg-black hover:text-white transition-all duration-300 hover:scale-105">
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className={`border-t border-gray-200 px-8 py-16 bg-gray-50 transition-all duration-700 ${
          isPageLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: "1000ms" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img src="/acme-logo.png" alt="BANANA SPORTSWEAR" className="h-8 w-auto opacity-40" />
          </div>

          <p className="text-gray-400 text-xs font-mono tracking-widest uppercase">
            © 2025 BANANA SPORTSWEAR, INC. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  )
}
