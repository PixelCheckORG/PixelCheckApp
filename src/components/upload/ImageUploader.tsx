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
        <div className="w-full">
            <div className="w-full max-w-3xl mx-auto">
                <label
                    htmlFor="image-upload"
                    className={`
              relative flex flex-col items-center justify-center w-full h-80 
              border-4 border-dashed rounded-2xl cursor-pointer
              transition-all duration-200 ease-in-out
              ${dragActive
                            ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                            : 'border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-500 hover:shadow-lg'
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
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                        ) : (
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                <Upload className="w-10 h-10 text-blue-600" />
                            </div>
                        )}
                        <p className="mb-3 text-2xl font-bold text-gray-800">
                            {isAnalyzing ? 'Analizando imagen...' : 'Arrastra una imagen aquí'}
                        </p>
                        <p className="text-base text-gray-600 mb-2">
                            {isAnalyzing ? 'Por favor espera' : 'o haz clic para seleccionar'}
                        </p>
                        {!isAnalyzing && (
                            <div className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-md">
                                Seleccionar Archivo
                            </div>
                        )}
                        {!isAnalyzing && (
                            <p className="text-xs text-gray-400 mt-4">
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
        </div>
    )
}