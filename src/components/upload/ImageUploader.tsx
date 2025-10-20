import { useState, useCallback } from 'react'
import { Upload, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
    onImageSelect: (file: File) => void
    isAnalyzing: boolean
}

export default function ImageUploader({ onImageSelect, isAnalyzing }: ImageUploaderProps) {
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type.startsWith('image/')) {
                onImageSelect(file)
            }
        }
    }, [onImageSelect])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type.startsWith('image/')) {
                onImageSelect(file)
            }
        }
    }, [onImageSelect])

    return (
        <div className="w-full max-w-2xl mx-auto">
            <label
                htmlFor="image-upload"
                className={`
          relative flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200 ease-in-out
          ${dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-primary-400'
                    }
          ${isAnalyzing ? 'pointer-events-none opacity-50' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isAnalyzing ? (
                        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                    ) : (
                        <Upload className="w-12 h-12 text-slate-400 mb-4" />
                    )}
                    <p className="mb-2 text-lg font-semibold text-slate-700">
                        {isAnalyzing ? 'Analizando imagen...' : 'Arrastra una imagen aquí'}
                    </p>
                    <p className="text-sm text-slate-500">
                        {isAnalyzing ? 'Por favor espera' : 'o haz clic para seleccionar'}
                    </p>
                    {!isAnalyzing && (
                        <p className="text-xs text-slate-400 mt-2">
                            PNG, JPG, GIF hasta 10MB
                        </p>
                    )}
                </div>
                <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={isAnalyzing}
                />
            </label>
        </div>
    )
}