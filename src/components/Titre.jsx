import React from 'react'
import { Row, Col, Button,Form } from 'react-bootstrap';
function Titre({ rapportLe, setRapportLe }) {
  const heures = rapportLe?.split("T")[1]
  const date = rapportLe?.split("T")[0]
 
  
  
  return (
    <Row className='   rounded-3 px-3  my-1'>
      <Col className=' card rounded'>
       <div style={{display : "flex" , justifyContent : "space-between", alignItems : "center"}}>
         <h5>
          <label className='form-label ' htmlFor="date"><i className="bi bi-safe-fill"></i> Rapport CTM Le : <i className='  px-3 rounded'> {rapportLe ? date : ""}</i></label>
          <Form.Control
          size='sm'
            id="date"
            className="form-control"
            value={rapportLe}
            onChange={e => setRapportLe(e.target.value)}
            type="datetime-local"
            name="rapportLe"
          />
        </h5>

        <h6 className='btnsuccess text-white px-2 py-1' style={{borderRadius : "50px"}}> <i className="bi bi-clock-history"></i> { rapportLe && heures.replace(":"," : ")}</h6>


       </div>
       
      </Col>
    </Row>
  )
}

export default Titre