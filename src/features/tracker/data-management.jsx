import { useState } from 'react'
import { parseTrackerImport, serializeTrackerData } from './tracker-storage'

function downloadJson(data) {
  const blob = new Blob([serializeTrackerData(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'routine-tracker-data.json'
  link.click()
  URL.revokeObjectURL(url)
}

export default function DataManagement({ data, onImport }) {
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function chooseFile(event) {
    const file = event.target.files?.[0]
    setPreview(null)
    setMessage('')
    setError('')
    if (!file) return
    const result = parseTrackerImport(await file.text())
    if (result.error) { setError(result.error); return }
    setPreview(result.data)
  }

  function confirmImport() {
    onImport(preview)
    setPreview(null)
    setMessage('Import complete. Your local routines and history were replaced with the reviewed file.')
  }

  return (
    <main className="page-content" id="main-content">
      <section className="data-header"><p className="eyebrow">Data</p><h1>Your routines stay yours.</h1><p>Back up or move your local Routine Tracker data without an account, cloud service, or external analytics.</p></section>
      {message && <p className="notice" role="status">{message}</p>}
      {error && <p className="form-errors" role="alert">{error} Your current data was not changed.</p>}
      <div className="data-grid">
        <section className="data-card" aria-labelledby="export-heading"><p className="eyebrow">Export</p><h2 id="export-heading">Download a backup</h2><p>Create a readable JSON file containing the current routine library and dated completion history.</p><button className="primary-button" type="button" onClick={() => downloadJson(data)}>Download JSON backup</button></section>
        <section className="data-card" aria-labelledby="import-heading"><p className="eyebrow">Import</p><h2 id="import-heading">Review before replacing</h2><p>Select a Routine Tracker version 2 JSON file. Nothing changes until you review the summary and confirm.</p><input className="visually-hidden" id="import-file" type="file" accept="application/json,.json" onChange={chooseFile} /><label className="file-picker" htmlFor="import-file">Choose JSON file</label></section>
      </div>
      {preview && <section className="import-preview" aria-labelledby="preview-heading"><p className="eyebrow">Import preview</p><h2 id="preview-heading">Ready to replace local data</h2><dl><div><dt>Routines</dt><dd>{preview.routines.length}</dd></div><div><dt>Saved days</dt><dd>{Object.keys(preview.days).length}</dd></div><div><dt>Format version</dt><dd>{preview.version}</dd></div></dl><p>This action replaces the routine library and history currently stored in this browser. Export a backup first if you may need the existing data.</p><div className="form-actions"><button className="danger-button" type="button" onClick={confirmImport}>Import reviewed data</button><button className="secondary-button" type="button" onClick={() => setPreview(null)}>Cancel</button></div></section>}
      <section className="privacy-note"><p className="eyebrow">Privacy boundary</p><h2>No network transfer</h2><p>Export creates a file on this device. Import reads the file in this browser. Routine Tracker does not upload either file or its contents.</p></section>
    </main>
  )
}
