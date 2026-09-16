import React from 'react'
import { Row, Col, Button } from 'react-bootstrap';
function Titre({ rapportLe, setRapportLe }) {
  const heures = rapportLe?.split("T")[1]
  const date = rapportLe?.split("T")[0]
 
  
  
  return (
    <Row className='my-5 '>
      <Col className='bg-dark rounded'>
       <div style={{display : "flex" , justifyContent : "space-between", alignItems : "center"}}>
         <h3>
          <label className='form-label text-white' htmlFor="date">Rapport CTM Le : <i className='  px-3 rounded'> {rapportLe ? date : ""}</i></label>
          <input
            id="date"
            className="form-control"
            value={rapportLe}
            onChange={e => setRapportLe(e.target.value)}
            type="datetime-local"
            name="rapportLe"
          />
        </h3>

        <h4 className='bg-primary text-white p-2' style={{borderRadius : "50px"}}> ⏱ {rapportLe && heures}</h4>

       </div>
       
      </Col>
    </Row>
  )
}

export default Titre