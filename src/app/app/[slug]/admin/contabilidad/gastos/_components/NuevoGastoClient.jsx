'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, CheckCircle2, X } from 'lucide-react'
import { GastoForm }       from './GastoForm'
import { crearGasto }      from '../actions'
import { analizarFactura } from '../actions'

const MAX_IMAGE_EDGE = 1500

async function downscaleImage(file) {
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap
  const longest = Math.max(width, height)
  if (longest <= MAX_IMAGE_EDGE) {
    bitmap.close()
    return file
  }

  const scale = MAX_IMAGE_EDGE / longest
  const targetW = Math.round(width * scale)
  const targetH = Math.round(height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close()

  const blob = await new Promise(resolve =>
    canvas.toBlob(resolve, 'image/jpeg', 0.85)
  )
  if (!blob) return file
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
}

export function NuevoGastoClient({ slug }) {
  const [file, setFile]                   = useState(null)
  const [optimizedFile, setOptimizedFile] = useState(null)
  const [loading, setLoading]             = useState(false)
  const [ocrData, setOcrData]             = useState(null)
  const [ocrError, setOcrError]           = useState(null)
  const [formKey, setFormKey]             = useState(0)
  const inputRef = useRef(null)

  function handleFile(selected) {
    if (!selected) return
    setFile(selected)
    setOptimizedFile(null)
    setOcrData(null)
    setOcrError(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  async function handleAnalizar() {
    if (!file) return
    setLoading(true)
    setOcrError(null)
    const optimized = await downscaleImage(file)
    const fd = new FormData()
    fd.append('factura', optimized)
    const result = await analizarFactura(null, fd)
    setLoading(false)
    if (result.error) {
      setOcrError(result.error)
    } else {
      setOptimizedFile(optimized)
      setOcrData(result.data)
      setFormKey(k => k + 1)
    }
  }

  function handleClear() {
    setFile(null)
    setOptimizedFile(null)
    setOcrData(null)
    setOcrError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const isImage = file && file.type.startsWith('image/')

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Analizar factura con IA</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sube una foto o PDF de la factura y la IA extraerá los datos automáticamente. Revísalos antes de guardar.
        </p>

        {/* Drop area */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !file && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl transition-colors ${
            file
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />

          {!file ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Upload size={32} className="mb-2" />
              <p className="text-sm font-medium">Haz clic o arrastra la factura aquí</p>
              <p className="text-xs mt-1">JPG, PNG, WEBP o PDF · máx. 8 MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-20 w-20 object-cover rounded-lg border border-gray-200 shrink-0"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-red-50 rounded-lg border border-red-100 shrink-0">
                  <FileText size={32} className="text-red-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                {ocrData && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                    <CheckCircle2 size={12} /> Datos extraídos
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); handleClear() }}
                className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Analizar button */}
        {file && !ocrData && (
          <button
            type="button"
            onClick={handleAnalizar}
            disabled={loading}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {loading ? 'Analizando...' : 'Analizar con IA'}
          </button>
        )}

        {ocrError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
            {ocrError}
          </p>
        )}

        {ocrData && (
          <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
            Factura analizada correctamente. Revisa los datos en el formulario y pulsa <strong>Guardar gasto</strong> para confirmar.
          </p>
        )}
      </div>

      {/* Expense form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          {ocrData ? 'Confirma los datos del gasto' : 'Datos del gasto'}
        </h2>
        <GastoForm
          key={formKey}
          action={crearGasto}
          initialData={ocrData}
          attachedFile={optimizedFile}
          submitLabel="Guardar gasto"
          cancelHref={`/app/${slug}/admin/contabilidad/gastos`}
        />
      </div>
    </div>
  )
}
