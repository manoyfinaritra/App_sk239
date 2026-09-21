import { Button, Modal, Spinner } from 'react-bootstrap'
import { useEffect, useMemo, useState } from 'react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

function Menu({ theme, setTheme, onNewReport, reports, onDeleteReportEvents, onRefreshReports, users, handleLogout, page, onShowAdministration, isDeletingReports = false, isSavingReport = false }) {
  const isLight = theme === 'light'
  const [showReports, setShowReports] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSite, setSelectedSite] = useState('')
  // Chargements affichés jusqu'à la fin de chaque action base.
  const [refreshing, setRefreshing] = useState(false)
  const [deletingSite, setDeletingSite] = useState('')
  const [exporting, setExporting] = useState(false)

  // Noms de sites distincts pour le filtre par banque.
  const siteOptions = useMemo(() => [...new Set((reports || []).map(event => event.site || event.title || 'Site non renseigné'))].sort((a, b) => a.localeCompare(b)), [reports])

  // `reports` = événements plats venus de la table `rapport` (1 ligne = 1 alarme).
  const reportEvents = useMemo(() => (reports || []).filter(event => {
    const date = (event.date_rapport || event.reportDate || event.alarm_time || event.alarmTime || '').slice(0, 10) || ''
    const site = event.site || event.title || 'Site non renseigné'
    return (!selectedDate || date === selectedDate) && (!selectedSite || site === selectedSite)
  }).map(event => ({
    ...event,
    site: event.site || event.title || 'Site non renseigné',
    acct: event.acct ?? '',
    callNo: event.call_no ?? event.callNo ?? event.CallNO ?? '',
    detector: event.detector ?? event.Detector ?? '',
    alarmInfo: event.alarm_info ?? event.alarmInfo ?? event.AlarmInfo ?? '',
    alarmTime: event.alarm_time ?? event.alarmTime ?? event.AlarmTime ?? (event.date_rapport || '').replace('T', ' '),
    reportDate: event.date_rapport || event.reportDate || '',
    negativeAlarm: event.handle_remark ?? event.handleRemark ?? event.negativeAlarm ?? '',
    handleRemark: event.handle_remark ?? event.handleRemark ?? event.negativeAlarm ?? '',
    dbId: event.dbId ?? event.id,
    id: event.id,
    reportId: event.id,
    rowIndex: event.id
  })), [reports, selectedDate, selectedSite])

  useEffect(() => {
    if (showReports) {
      setRefreshing(true)
      onRefreshReports?.()?.catch(() => {}).finally(() => setRefreshing(false))
    }
  }, [showReports])
  const eventsBySite = useMemo(() => reportEvents.reduce((groups, event) => {
    groups[event.site] = [...(groups[event.site] || []), event]
    return groups
  }, {}), [reportEvents])

  const handleExportByDate = async () => {
    setExporting(true)
    try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rapports')
    worksheet.properties.pageSetUpPr = { fitToPage: true, autoPageBreaks: false }
    worksheet.pageSetup = {
      orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      horizontalDpi: 300, verticalDpi: 300,
      margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }
    }
    worksheet.columns = [
      { header: 'Acct', key: 'acct', width: 12 },
      { header: 'CallNO', key: 'callNo', width: 20 },
      { header: 'Detector', key: 'detector', width: 15 },
      { header: 'AlarmInfo', key: 'alarmInfo', width: 40 },
      { header: 'AlarmTime', key: 'alarmTime', width: 25 },
      { header: 'HandleRemark', key: 'handleRemark', width: 30 }
    ]
    worksheet.spliceRows(1, 1)

    const cellBorder = {
      top: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    const styleEventRow = (row) => {
      row.height = 25
      row.eachCell(cell => {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.border = cellBorder
      })
    }
    const addHeader = () => {
      const row = worksheet.addRow(['Acct', 'CallNO', 'Detector', 'AlarmInfo', 'AlarmTime', 'HandleRemark'])
      row.height = 30
      row.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.border = cellBorder
      })
    }

    Object.entries(eventsBySite).forEach(([site, events]) => {
      const siteRow = worksheet.addRow([site])
      worksheet.mergeCells(`A${siteRow.number}:F${siteRow.number}`)
      siteRow.height = 24
      siteRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
      siteRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B3156' } }
      siteRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
      siteRow.getCell(1).border = cellBorder
      addHeader()
      events.forEach(event => styleEventRow(worksheet.addRow({ ...event, handleRemark: '' })))
    })

    // Zone réservée aux signatures, imprimée sous le tableau.
    worksheet.addRow([]).height = 22
    worksheet.addRow([]).height = 22
    const signatureRow = worksheet.addRow(['CTM', '', 'Admin Tech', '', 'Adj Resp Tech', 'Direction'])
    signatureRow.height = 30
    signatureRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FF1F4E78' }, size: 11 }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { top: { style: 'thin', color: { argb: 'FF1F4E78' } } }
    })

    worksheet.views = [{ state: 'frozen', ySplit: 2 }]
    worksheet.printArea = `A1:F${worksheet.rowCount}`
    const buffer = await workbook.xlsx.writeBuffer()
    const safeSite = selectedSite.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim()
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Rapports_${selectedDate}${safeSite ? `_${safeSite}` : ''}.xlsx`)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteSite = async (events) => {
    if (!events.length) return

    const site = events[0].site
    const confirmed = window.confirm(`Supprimer les ${events.length} événement(s) de « ${site} » pour la date affichée ?`)
    if (!confirmed) return
    setDeletingSite(site)
    try {
      await onDeleteReportEvents(events)
    } catch (error) {
      console.error(error)
      window.alert(error?.message || 'Suppression impossible.')
    } finally {
      setDeletingSite('')
    }
  }
  return (
    <>
      <aside className='dashboard-sidebar'>
        <div className='sidebar-brand'><span className='brand-icon'><i className='bi bi-shield-check'></i></span><span>CTM <small>{users.email && users.email}</small></span></div>
        <p className='sidebar-label'>RAPPORTS</p>
        <nav className='sidebar-nav' aria-label='Navigation principale'>
          <button className={`sidebar-link ${page === 'report' ? 'active' : ''}`} onClick={onNewReport}><i className='bi bi-file-earmark-plus'></i><span>Nouveau rapport</span></button>
          <button className='sidebar-link' onClick={() => setShowReports(true)}><i className='bi bi-card-list'></i><span>Liste des rapports</span><b>{reports.length}</b></button>
          <button title='Gérer les sites (ajouter, modifier, supprimer)' className={`sidebar-link ${page === 'administration' ? 'active' : ''}`} onClick={onShowAdministration}><i className='bi bi-gear'></i><span>Administration</span></button>

        </nav>
        <div className='sidebar-bottom'>
          <p className='sidebar-label'>PARAMETRES</p>
          <button type='button' className='sidebar-link sidebar-action' onClick={() => setTheme(isLight ? 'dark' : 'light')} title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}>
            <i className={`bi bi-${isLight ? 'moon-stars' : 'sun'}`}></i><span>Mode {isLight ? 'sombre' : 'clair'}</span>
          </button>
          <button type='button' className='sidebar-link sidebar-action sidebar-logout' onClick={handleLogout} title='Se déconnecter'>
            <i className='bi bi-power'></i><span>Deconnexion</span>
          </button>
        </div>
      </aside>

      <Modal show={showReports} onHide={() => setShowReports(false)} className='report-modal' size='xl' centered scrollable>
        <Modal.Header closeButton><div><Modal.Title>Rapports par site</Modal.Title><p className='mb-0 modal-subtitle'>Tous les événements exportés, regroupés par banque.</p></div></Modal.Header>
        <Modal.Body>
          <div className='history-filters mb-4'>
            <div>
              <label htmlFor='report-date'>Date du rapport</label>
              <input id='report-date' type='date' value={selectedDate} onChange={event => setSelectedDate(event.target.value)} />
            </div>
            <div>
              <label htmlFor='report-site'>Nom du site</label>
              <select id='report-site' value={selectedSite} onChange={event => setSelectedSite(event.target.value)}>
                <option value=''>Tous les sites</option>
                {siteOptions.map(site => <option key={site} value={site}>{site}</option>)}
              </select>
            </div>
            {selectedDate && <Button variant='outline-secondary' size='sm' onClick={() => setSelectedDate('')}>Toutes les dates</Button>}
            {selectedSite && <Button variant='outline-secondary' size='sm' onClick={() => setSelectedSite('')}>Tous les sites</Button>}
            <span className='history-result'>{refreshing ? (<span className='d-inline-flex align-items-center gap-2'><Spinner as="span" animation="border" size="sm" role="status" />Chargement...</span>) : (<>{reportEvents.length} événement{reportEvents.length !== 1 ? 's' : ''}</>)}{isDeletingReports && ' • Suppression en cours...'}{isSavingReport && ' • Enregistrement en cours...'}</span>
            {<Button title={'Vous devez filtrer par date'} disabled={!selectedDate || exporting} className='history-export' size='sm' onClick={handleExportByDate}>{exporting ? (<><Spinner as="span" animation="border" size="sm" role="status" className='me-1' />Export...</>) : (<><i className='bi bi-file-earmark-spreadsheet me-1'></i>Exporter en Excel</>)}</Button>}
          </div>
          {reportEvents.length === 0 ?
            <div className='history-empty'>
              <i className='bi bi-folder2-open'></i>
              <p>{reports.length ? 'Aucun événement ne correspond à ces filtres.' : 'Aucun rapport exporté pour le moment.'}</p></div> : (
              <div className='site-report-list'>{Object.entries(eventsBySite).map(([site, events]) => <section className='site-report-card' key={site}>
                <div className='site-report-title'>
                  <div>
                    <i className='bi bi-bank me-2'></i>
                    {site}

                  </div>
                  <span className=' d-flex align-items-center gap-2'>
                    {events.length} événement{events.length !== 1 ? 's' : ''}
                    <Button size='sm' variant='outline-danger' disabled={deletingSite === site || isDeletingReports} onClick={() => handleDeleteSite(events)} title={`Supprimer tous les événements du site "${site}"`}><span className='visually-hidden'>Supprimer</span>
                      {(deletingSite === site || (isDeletingReports && deletingSite === site)) ? <Spinner as="span" animation="border" size="sm" role="status" /> : <i className='bi bi-trash'></i>}</Button>
                  </span>

                </div>
                <div className='history-table-wrap'>
                  <table className='table table-hover align-middle history-table'><thead>
                    <tr>
                      <th>Acct</th>
                      <th>Call No</th>
                      <th>Détecteur</th>
                      <th>Information d’alarme</th>
                      <th>Date et heure</th>
                      <th>HandleRemark</th>

                    </tr>
                  </thead>
                    <tbody>
                      {events.map(event =>
                        <tr key={event.id}>
                          <td>{event.acct}</td>
                          <td>{event.callNo}</td>
                          <td className='text-uppercase'>{event.detector}</td>
                          <td>{event.alarmInfo}</td>
                          <td>{event.alarmTime || event.reportDate?.replace('T', ' ')}</td>
                          <td>{event.negativeAlarm || ""}</td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </section>)}</div>
            )}
        </Modal.Body>
        <Modal.Footer><Button variant='secondary' onClick={() => setShowReports(false)}>Fermer X</Button></Modal.Footer>
      </Modal>
    </>
  )
}

export default Menu
