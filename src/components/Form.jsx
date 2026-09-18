import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { Row, Col } from 'react-bootstrap'
import Swal from 'sweetalert2'


function Formulaire({
  nom_detecteur,
  sites,
  stock_detecteur,
  setStockdetecteur,
  stock_sites,
  setStocksite,
  setAllstock,
  setTitreExport,
  rapportLe,
  isFinish,
  setIsfinish,
  isEdit,
  setIsEdit,
  allStock,
  idModif
}) {

  // Générer les codes : c1, c2, ..., b1, b2, ...
  const code_detecteur = []

  nom_detecteur.forEach(e => {
    e.numeros.forEach(d => {
      e.lettre.code.forEach(f => {
        code_detecteur.push(f + d)
      })
      code_detecteur.push(d)
    })
  })

  const handlerSubmit = (e) => {
    e.preventDefault()

    const result = sites.find(e => e.nom === stock_sites)

    if (!result) {
      alert("Veuillez sélectionner un site")
      return
    }

    if (!stock_detecteur) {
      alert("Veuillez sélectionner un détecteur")
      return
    }
    if (!rapportLe) {
      alert("Veuillez sélectionner la date et l'heure du rapport")
      return
    }

    const nouvelleValeur = {
      ...result,
      detct: stock_detecteur,
      date: rapportLe
    }

    // Ajouter la nouvelle soumission à l'historique
    setAllstock(ancienStock => [
      ...ancienStock,
      nouvelleValeur
    ])

    setTitreExport(stock_sites + " " + rapportLe)

    Swal.fire({
      title: "Insertion Reussi!",
      icon: "success",
      draggable: true
    });
    // setIsfinish(false)
  }

  const handleModif = (e) => {
    e.preventDefault()
    const newStock = allStock.map((d , i) => {
      if(i === idModif){
          return {...d, nom : stock_sites, date : rapportLe, detct : stock_detecteur}
      }
      return d
    })

    setAllstock(newStock)

     Swal.fire({
      title: "Modification Reussi!",
      icon: "success",
      draggable: true
    });

    setIsEdit(false)
  }

  return (
    <Row className='mb-1'>
      <Col>

        <Form className="section-card">
          <fieldset>
            <div className='d-flex align-items-center gap-2 mb-3'>
              <i className='bi bi-plus-circle-fill text-info'></i>
              <div><h2 className='section-title mb-0'>Nouvelle alarme</h2><p className='section-subtitle mb-0'>Renseignez le site et le détecteur concerné.</p></div>
            </div>

            {/* SITE */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Banque :
              </Form.Label>

              <Form.Select
              size='sm'
              disabled={isFinish}
                value={stock_sites}
                onChange={e => setStocksite(e.target.value)}
              >
                <option value="">Sélectionnez un site</option>

                {[...sites]
                  .sort((a, b) => a.nom.localeCompare(b.nom))
                  .map((e, i) => (
                    <option value={e.nom} key={i}>
                      {e.acct + " : " + e.nom}
                    </option>
                  ))}
              </Form.Select>

              <div className="selection-note mt-2">Site sélectionné : <strong>{stock_sites || "Aucun"}</strong></div>
            </Form.Group>

            {/* DETECTEUR */}
            <Form.Group className="mb-3">
              <Form.Label>
                Détecteur :
              </Form.Label>

              <Form.Select
              size='sm'
                value={stock_detecteur}
                onChange={e => setStockdetecteur(e.target.value)}
              >
                <option value="">Sélectionnez un détecteur</option>

                {code_detecteur

                  .filter(e => e != 9)
                  .sort()
                  .map((i, it) => (
                    <option
                      className="text-uppercase"
                      value={i}
                      key={it}
                    >
                      {(i == 1) ? i + " : DO" : (i == 2 || i == 3 || i == 4 || i == 5 || i == 6) ? i + " : DM" : (i == 7) ? i + " : BP " : (i == 8) ? i + " : BG " : i}
                    </option>
                  ))}
              </Form.Select>

              <div className="selection-note mt-2">Détecteur sélectionné : <strong className='text-uppercase'>{stock_detecteur || "Aucun"}</strong></div>
            </Form.Group>

            {/* DATE */}
            {/* <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Date et Heure :
              </Form.Label>

              <input
                value={stockdate}
                onChange={e => setStockdate(e.target.value)}
                className="form-control"
                type="date"
                disabled
              />

              <small> 
                Vous avez sélectionné :
                <i className="text-primary fw-bold ms-1">
                  {stockdate || "?"}
                </i>
              </small>
            </Form.Group> */}

            {/* CHECKBOX */}
            <Form.Group className="mb-3">
              <Form.Check
                checked={isFinish}
                onChange={e => setIsfinish(e.target.checked)}
                type="checkbox"
                label="Sélectionnez si vous avez rempli tous les champs"
              />
            </Form.Group>

            {/* BOUTON */}
            {!isEdit ? <Button
              className=" btnprimary"
              disabled={!isFinish}
              type="submit"
              onClick={handlerSubmit}
              size='sm'
            >
              Ajouter au rapport <i className="bi bi-plus-lg ms-1"></i>
            </Button> : <Button
              className="btn btn-primary btnmodifier"
              disabled={!isFinish}
              type="button"
              variant='success'
              onClick={handleModif}
              size='sm'
            >
              Modifier
            </Button>}

          </fieldset>
        </Form>

      </Col>
    </Row>
  )
}

export default Formulaire
