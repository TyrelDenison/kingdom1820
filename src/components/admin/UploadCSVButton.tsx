'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

interface UploadResult {
  total: number
  created: number
  updated: number
  failed: number
  errors: Array<{ name?: string; row?: number; error: string }>
}

export const UploadCSVButton: React.FC = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentProgram, setCurrentProgram] = useState<string>('')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const resetState = () => {
    setProgress(0)
    setCurrentProgram('')
    setResult(null)
    setError(null)
    setSelectedFile(null)
    setIsDragging(false)
  }

  const handleOpen = () => {
    resetState()
    setIsModalOpen(true)
  }

  const handleClose = () => {
    if (!isUploading) {
      setIsModalOpen(false)
      resetState()
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }
    setSelectedFile(file)
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setIsUploading(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      // Read file content
      const content = await selectedFile.text()

      // Create form data
      const formData = new FormData()
      formData.append('csv', content)

      // Upload to endpoint
      const response = await fetch('/api/programs/upload-csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: string }
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadResult = await response.json() as UploadResult
      setResult(uploadResult)
      setProgress(100)

      // Refresh the list if any programs were created/updated
      if (uploadResult.created > 0 || uploadResult.updated > 0) {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClickDropzone = () => {
    fileInputRef.current?.click()
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <Button buttonStyle="secondary" onClick={handleOpen}>
        Upload CSV
      </Button>

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={handleClose}
        >
          <div
            style={{
              backgroundColor: 'var(--theme-elevation-0)',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Upload Programs CSV</h2>
              <button
                onClick={handleClose}
                disabled={isUploading}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  color: 'var(--theme-elevation-500)',
                  opacity: isUploading ? 0.5 : 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Drop zone */}
            <div
              onClick={handleClickDropzone}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? 'var(--theme-success-500)' : 'var(--theme-elevation-400)'}`,
                borderRadius: '8px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragging ? 'var(--theme-success-100)' : 'var(--theme-elevation-50)',
                transition: 'all 0.2s ease',
                marginBottom: '20px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
              <div style={{ marginBottom: '10px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--theme-elevation-400)' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              {selectedFile ? (
                <p style={{ margin: 0, color: 'var(--theme-success-500)', fontWeight: 500 }}>
                  Selected: {selectedFile.name}
                </p>
              ) : (
                <>
                  <p style={{ margin: '0 0 5px', fontWeight: 500 }}>
                    Drop your CSV file here
                  </p>
                  <p style={{ margin: 0, color: 'var(--theme-elevation-500)', fontSize: '0.875rem' }}>
                    or click to browse
                  </p>
                </>
              )}
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-600)' }}>
                    {currentProgram ? `Processing: ${currentProgram}` : 'Uploading...'}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-600)' }}>
                    {progress}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--theme-elevation-200)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: 'var(--theme-success-500)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'var(--theme-error-100)',
                border: '1px solid var(--theme-error-500)',
                borderRadius: '6px',
                marginBottom: '20px',
              }}>
                <p style={{ margin: 0, color: 'var(--theme-error-500)', fontWeight: 500 }}>
                  Error
                </p>
                <p style={{ margin: '5px 0 0', color: 'var(--theme-error-600)' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Success result */}
            {result && (
              <div style={{
                padding: '16px',
                backgroundColor: result.failed === 0 ? 'var(--theme-success-100)' : 'var(--theme-warning-100)',
                border: `1px solid ${result.failed === 0 ? 'var(--theme-success-500)' : 'var(--theme-warning-500)'}`,
                borderRadius: '6px',
                marginBottom: '20px',
              }}>
                <p style={{
                  margin: '0 0 12px',
                  fontWeight: 600,
                  color: result.failed === 0 ? 'var(--theme-success-600)' : 'var(--theme-warning-600)',
                }}>
                  {result.failed === 0 ? 'Upload Complete!' : 'Upload Complete with Errors'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--theme-elevation-0)', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>Total Rows</span>
                    <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 600 }}>{result.total}</p>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--theme-elevation-0)', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--theme-success-500)', textTransform: 'uppercase' }}>Created</span>
                    <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 600, color: 'var(--theme-success-600)' }}>{result.created}</p>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--theme-elevation-0)', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>Updated</span>
                    <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 600 }}>{result.updated}</p>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--theme-elevation-0)', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: result.failed > 0 ? 'var(--theme-error-500)' : 'var(--theme-elevation-500)', textTransform: 'uppercase' }}>Failed</span>
                    <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 600, color: result.failed > 0 ? 'var(--theme-error-600)' : 'inherit' }}>{result.failed}</p>
                  </div>
                </div>

                {/* Error details */}
                {result.errors.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 500, fontSize: '0.875rem' }}>
                      Errors ({result.errors.length}):
                    </p>
                    <div style={{
                      maxHeight: '150px',
                      overflow: 'auto',
                      backgroundColor: 'var(--theme-elevation-0)',
                      borderRadius: '4px',
                      padding: '8px',
                    }}>
                      {result.errors.map((err, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '8px',
                            borderBottom: index < result.errors.length - 1 ? '1px solid var(--theme-elevation-100)' : 'none',
                            fontSize: '0.875rem',
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>
                            {err.row ? `Row ${err.row}` : 'Unknown row'}
                            {err.name && ` (${err.name})`}:
                          </span>
                          <span style={{ color: 'var(--theme-error-500)', marginLeft: '8px' }}>
                            {err.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CSV format help */}
            {!result && (
              <details style={{ marginBottom: '20px' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--theme-elevation-600)', fontSize: '0.875rem' }}>
                  CSV Format Requirements
                </summary>
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--theme-elevation-50)',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Required columns:</p>
                  <ul style={{ margin: '0 0 12px', paddingLeft: '20px' }}>
                    <li>name (or program_name)</li>
                    <li>religiousAffiliation (protestant/catholic)</li>
                    <li>address</li>
                    <li>city</li>
                    <li>state (2-letter code, e.g., CA)</li>
                    <li>zipCode (5 digits)</li>
                    <li>meetingFormat (in-person/online/both)</li>
                    <li>meetingFrequency (weekly/bi-monthly/monthly/quarterly)</li>
                    <li>meetingType (peer-group/forum/small-group)</li>
                  </ul>
                  <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Optional columns:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>description</li>
                    <li>meetingLength (hours)</li>
                    <li>averageAttendance</li>
                    <li>hasConferences (none/annual/multiple)</li>
                    <li>hasOutsideSpeakers (true/false)</li>
                    <li>hasEducationTraining (true/false)</li>
                    <li>annualPrice</li>
                    <li>monthlyPrice</li>
                    <li>contactEmail</li>
                    <li>contactPhone</li>
                    <li>website</li>
                  </ul>
                </div>
              </details>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {result ? (
                <Button buttonStyle="primary" onClick={handleClose}>
                  Done
                </Button>
              ) : (
                <>
                  <Button buttonStyle="secondary" onClick={handleClose} disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button
                    buttonStyle="primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadCSVButton
