import { Button, Modal } from 'react-bootstrap'
import { useMemo, useState } from 'react'

function Menu({ theme, setTheme, onNewReport, reports }) {
  const isLight = theme === 'light'
  const [showReports, setShowReports] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const reportEvents = useMemo(() => reports.filter(report => {
    const date = report.reportDate?.slice(0, 10) || ''
    return !selectedDate || date === selectedDate
  }).flatMap(report => report.rows.map(row => ({
    ...row,
    site: row.site || report.title || 'Site non renseigné',
    acct: row.acct ?? row.Acct ?? '',
    callNo: row.callNo ?? row.CallNO ?? '',
    detector: row.detector ?? row.Detector ?? '',
    alarmInfo: row.alarmInfo ?? row.AlarmInfo ?? '',
    alarmTime: row.alarmTime ?? row.AlarmTime ?? '',
    reportDate: report.reportDate,
    id: `${report.id}-${row.acct}-${row.detector}-${row.alarmTime}`
  }))), [reports, selectedDate])
  const eventsBySite = useMemo(() => reportEvents.reduce((groups, event) => {
    groups[event.site] = [...(groups[event.site] || []), event]
    return groups
  }, {}), [reportEvents])

  return (
    <>
      <aside className='dashboard-sidebar'>
        <div className='sidebar-brand'><span className='brand-icon'><i className='bi bi-shield-check'></i></span><span>CTM <small>REPORTS</small></span></div>
        <p className='sidebar-label'>RAPPORTS</p>
        <nav className='sidebar-nav' aria-label='Navigation principale'>
          <button className='sidebar-link active' onClick={onNewReport}><i className='bi bi-file-earmark-plus'></i><span>Nouveau rapport</span></button>
          <button className='sidebar-link' onClick={() => setShowReports(true)}><i className='bi bi-card-list'></i><span>Liste des rapports</span><b>{reports.length}</b></button>
        </nav>
        <div className='sidebar-bottom'>
          <p className='sidebar-label'>APPARENCE</p>
          <button className='sidebar-link' onClick={() => setTheme(isLight ? 'dark' : 'light')}>
            <i className={`bi bi-${isLight ? 'moon-stars' : 'sun'}`}></i><span>Mode {isLight ? 'sombre' : 'clair'}</span>
          </button>
        </div>
      </aside>

      <Modal show={showReports} onHide={() => setShowReports(false)} className='report-modal' size='xl' centered scrollable>
        <Modal.Header closeButton><div><Modal.Title>Rapports par site</Modal.Title><p className='mb-0 modal-subtitle'>Tous les événements exportés, regroupés par banque.</p></div></Modal.Header>
        <Modal.Body>
          <div className='history-filters mb-4'>
            <div><label htmlFor='report-date'>Date du rapport</label><input id='report-date' type='date' value={selectedDate} onChange={event => setSelectedDate(event.target.value)} /></div>
            {selectedDate && <Button variant='outline-secondary' size='sm' onClick={() => setSelectedDate('')}>Toutes les dates</Button>}
            <span className='history-result'>{reportEvents.length} événement{reportEvents.length !== 1 ? 's' : ''}</span>
          </div>
          {reportEvents.length === 0 ? <div className='history-empty'><i className='bi bi-folder2-open'></i><p>{reports.length ? 'Aucun événement ne correspond à cette date.' : 'Aucun rapport exporté pour le moment.'}</p></div> : (
            <div className='site-report-list'>{Object.entries(eventsBySite).map(([site, events]) => <section className='site-report-card' key={site}>
              <div className='site-report-title'><div><i className='bi bi-bank me-2'></i>{site}</div><span>{events.length} événement{events.length !== 1 ? 's' : ''}</span></div>
              <div className='history-table-wrap'><table className='table table-hover align-middle history-table'><thead><tr><th>Acct</th><th>Call No</th><th>Détecteur</th><th>Information d’alarme</th><th>Date et heure</th></tr></thead><tbody>
                {events.map(event => <tr key={event.id}><td>{event.acct}</td><td>{event.callNo}</td><td className='text-uppercase'>{event.detector}</td><td>{event.alarmInfo}</td><td>{event.alarmTime || event.reportDate?.replace('T', ' ')}</td></tr>)}
              </tbody></table></div>
            </section>)}</div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant='secondary' onClick={() => setShowReports(false)}>Fermer</Button></Modal.Footer>
      </Modal>
    </>
  )
}

export default Menu
