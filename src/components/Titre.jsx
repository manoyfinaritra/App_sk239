import { Row, Col, Form } from 'react-bootstrap';
function Titre({ rapportLe, setRapportLe }) {
  const [date = '', heures = ''] = rapportLe?.split('T') || []
  return (
    <Row className='g-3 mb-1'>
      <Col>
       <section className='section-card d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3'>
        <div><div className='d-flex align-items-center gap-2 mb-1'><i className="bi bi-shield-check fs-4 text-info"></i><h1 className='report-title h5 mb-0'>Rapport CTM</h1></div><p className='section-subtitle mb-0'>Centralisez les alarmes et préparez l’export Excel.</p></div>
        <div className='d-flex flex-column flex-sm-row align-items-sm-center gap-2'>
          <div><label className='visually-hidden' htmlFor="date">Date et heure du rapport</label>
          <Form.Control
            id="date"
            aria-label="Date et heure du rapport"
            value={rapportLe}
            onChange={e => setRapportLe(e.target.value)}
            type="datetime-local"
            name="rapportLe"
          />
          </div><div className='time-badge rounded-pill px-3 py-2 text-nowrap small'><i className="bi bi-calendar3 me-2"></i>{date || 'Date non définie'}{heures && ` · ${heures}`}</div>
        </div></section>
      </Col>
    </Row>
  )
}

export default Titre
