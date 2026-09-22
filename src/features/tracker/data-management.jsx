/**
 * Local backup boundary. Export creates a browser download; import validates and
 * previews a file before the user can confirm replacement of current local data.
 * Neither path sends wellness data over the network.
 */
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

export default function DataManagement({ data, onImport, cloudStatus, signedIn }) {
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
    setMessage('Import complete. Your local goals, reminders, and history were replaced with the reviewed file.')
  }

  return (
    <main className="page-content" id="main-content">
      <section className="data-header"><p className="eyebrow">Data</p><h1>Your data stays yours.</h1><p>{signedIn ? 'Your journal is stored privately in your account and cached in this browser for continuity.' : 'Back up or move this local wellness journal. Sign in to keep a private cloud copy across devices.'}</p></section>
      {signedIn && <p className="notice" role="status">Cloud sync: {cloudStatus === 'synced' ? 'up to date' : cloudStatus === 'connecting' ? 'connecting…' : 'needs attention; this browser still has your latest local copy.'}</p>}
      {message && <p className="notice" role="status">{message}</p>}
      {error && <p className="form-errors" role="alert">{error} Your current data was not changed.</p>}
      <div className="data-grid">
        <section className="data-card" aria-labelledby="export-heading"><p className="eyebrow">Export</p><h2 id="export-heading">Download a backup</h2><p>Create a readable JSON file containing goals, reminders, and dated wellness entries.</p><button className="primary-button" type="button" onClick={() => downloadJson(data)}>Download JSON backup</button></section>
        <section className="data-card" aria-labelledby="import-heading"><p className="eyebrow">Import</p><h2 id="import-heading">Review before replacing</h2><p>Select a version 3 wellness JSON file. Nothing changes until you review the summary and confirm.</p><input className="visually-hidden" id="import-file" type="file" accept="application/json,.json" onChange={chooseFile} /><label className="file-picker" htmlFor="import-file">Choose JSON file</label></section>
      </div>
      {preview && <section className="import-preview" aria-labelledby="preview-heading"><p className="eyebrow">Import preview</p><h2 id="preview-heading">Ready to replace local data</h2><dl><div><dt>Goals</dt><dd>{Object.keys(preview.goals).length}</dd></div><div><dt>Saved days</dt><dd>{Object.keys(preview.days).length}</dd></div><div><dt>Format version</dt><dd>{preview.version}</dd></div></dl><p>This action replaces the local wellness data currently stored in this browser. Export a backup first if you may need the existing data.</p><div className="form-actions"><button className="danger-button" type="button" onClick={confirmImport}>Import reviewed data</button><button className="secondary-button" type="button" onClick={() => setPreview(null)}>Cancel</button></div></section>}
      <section className="privacy-note"><p className="eyebrow">Privacy boundary</p><h2>{signedIn ? 'Private account sync' : 'No network transfer'}</h2><p>{signedIn ? 'When signed in, entries sync only to the private account that created them. Export creates a file on this device and import reads that file in this browser.' : 'Export creates a file on this device. Import reads the file in this browser. Routine Tracker does not upload either file or its contents while you are signed out.'}</p></section>
    </main>
  )
}
