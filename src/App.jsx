import { useEffect, useMemo, useState } from 'react'
import Formulaire from './components/Form'
import { Container } from 'react-bootstrap'
import Titre from './components/Titre'
import Liste from './components/Liste'
import Menu from './components/Menu'
import './App.css'

const REPORTS_STORAGE_KEY = 'ctm-exported-reports'

function App() {

  const [stock_detecteur, setStockdetecteur] = useState("")
  const [stock_sites, setStocksite] = useState("")
  const [rapportLe, setRapportLe] = useState("")
  const [allStock, setAllstock] = useState([])
  const [titre_export, setTitreExport] = useState("Rapport")
  const [isFinish, setIsfinish] = useState(false)
   const [isEdit, setIsEdit] = useState(false)
   const [idModif, setIdModfi] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [savedReports, setSavedReports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(REPORTS_STORAGE_KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light')
  }, [theme])

  useEffect(() => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(savedReports))
  }, [savedReports])

  const handleReportExport = (report) => {
    setSavedReports(previousReports => [report, ...previousReports])
  }

  const handleDeleteReportEvents = (eventsToDelete) => {
    const eventKeys = new Set(eventsToDelete.map(event => `${event.reportId}-${event.rowIndex}`))
    setSavedReports(previousReports => previousReports
      .map(report => {
        const rows = report.rows.filter((_, rowIndex) => !eventKeys.has(`${report.id}-${rowIndex}`))
        return { ...report, rows, count: rows.length }
      })
      .filter(report => report.rows.length > 0)
    )
  }

  const handleNewReport = () => {
    setStockdetecteur('')
    setStocksite('')
    setRapportLe('')
    setAllstock([])
    setTitreExport('Rapport')
    setIsfinish(false)
    setIsEdit(false)
    setIdModfi(null)
  }

  const nom_detecteur = [
    {
      lettre: {
        code: ["c", "b"],
        fonction: ["arme", "disarme"]
      },
      numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
  ]

  const sites = [
    { acct: 311, nom: "BRED BANQUE ANDRAHARO", numeros: "+261321174395", da: "", sa: "", ccl: "Mme ARISOA" },
    { acct: 318, nom: "BRED BANQUE  BYPASS", numeros: "+261321174243", da: "Mr LEO", sa: "Mr ROJO", ccl: "" },
    { acct: 329, nom: "BRED BANQUE  ANTSIRABE ", numeros: "+261320329862", da: "Mr CHRISTIAN", sa: "Mr DINA", ccl: "" },
    { acct: 314, nom: "GAB BRED BANQUE TANA WATERFRONT", numeros: "+261321174418", da: "", sa: "", ccl: "" },
    { acct: 315, nom: "GAB BRED BANQUE ANDRANOTAPAHANA ", numeros: "+261321174246", da: "", sa: "", ccl: "" },
    { acct: 313, nom: "BRED BANQUE  LA CITY IVANDRY ", numeros: "+261321174397", da: "Mr LALAINA", sa: "Mr HERILANTO", ccl: "Mr FINARITRA" },
    { acct: 316, nom: "BRED BANQUE  ILAFY", numeros: "+261321174244", da: "Mme MICHELLE", sa: "Mr NOELY", ccl: "" },
    { acct: 300, nom: "GAB BRED BANQUE  MAHAZO", numeros: "+261321174141", da: "", sa: "", ccl: "" },
    { acct: 305, nom: "BRED BANQUE  AMBATONDRAZAKA", numeros: "+261321174220", da: "Mr ANDRIANINA", sa: "Mr RIVO", ccl: "Mr LALA" },
    { acct: 317, nom: "BRED BANQUE  ANOSIALA", numeros: "+261321174245", da: "Mme MBOLA", sa: "Mme VOAHANGY", ccl: "" },
    { acct: 333, nom: "BRED BANQUE  MANJAKANDRIANA", numeros: "+261321174249", da: "Mme FITIA", sa: "Mme FITIA", ccl: "Mme FITIA" },
    { acct: 306, nom: "GAB BRED BANQUE  ANTSAHAVOLA", numeros: "+261321174121", da: "", sa: "", ccl: "" },
    { acct: 306, nom: "GAB BRED BANQUE   DZAMANDZAR", numeros: "+261321174443", da: "", sa: "", ccl: "" },
    { acct: 309, nom: "GAB BRED BANQUE  MALAZA ", numeros: "+261321174431", da: "", sa: "", ccl: "" },
    { acct: 320, nom: "GAB BRED BANQUE SAINTE MARIE", numeros: "+261321174247", da: "", sa: "", ccl: "" },
    { acct: 302, nom: "GAB BRED BANQUE AMBANJA", numeros: "+261321174169", da: "Mme JUDY", sa: "Mr ASSANY", ccl: "" }
  ]

  // Calculer les responsables de chaque détecteur
  const responsables = useMemo(() => {

    return allStock.map((e) => {

      let responsable = ""
      let alarm = ""

      // Déterminer le type d'alarme
      if (e.detct[0] === "c") {
        alarm = "DISARM ZONE"
      }

      if (e.detct[0] === "b") {
        alarm = "ARM ZONE"
      }

      //zone chiffres
      if (e.detct[0] == 1) {
        responsable = "DETECTEUR D'OUVERTURE"
      }
      if (e.detct[0] == 2 || e.detct[0] == 3 || e.detct[0] == 4 || e.detct[0] == 5 || e.detct[0] == 6) {
        responsable = "DETECTEUR DE MOUVEMENT"
      }


      if (e.detct[0] == 7) {
        responsable = "BOUTON DE PANIQUE"
      }
      if (e.detct[0] == 8) {
        responsable = "BRISE GLACE"
      } //zone chiffres

      // Déterminer le responsable selon le chiffre
      if (e.detct[1] === "1") {
        responsable = e.da + " " + alarm + " PR"
      }

      if (e.detct[1] === "2") {
        responsable = e.da + " " + alarm + " GAB"
      }

      if (e.detct[1] === "3") {
        responsable = e.da + " " + alarm + " SF"
      }

      if (e.detct[1] === "4") {
        responsable = e.sa + " " + alarm + " PR"
      }

      if (e.detct[1] === "5") {
        responsable = e.sa + " " + alarm + " GAB"
      }

      if (e.detct[1] === "6") {
        responsable = e.sa + " " + alarm + " SF"
      }

      if (e.detct[1] === "7") {
        responsable = e.ccl + " " + alarm + " PR"
      }

      if (e.detct[1] === "8") {
        responsable = e.ccl + " " + alarm + " GAB"
      }

      if (e.detct[1] === "9") {
        responsable = e.ccl + " " + alarm + " SF"
      }

      return responsable.trim()

    })

  }, [allStock])

  return (
    <main className='dashboard-layout'>
      <Menu theme={theme} setTheme={setTheme} onNewReport={handleNewReport} reports={savedReports} onDeleteReportEvents={handleDeleteReportEvents} />
      <section className='app-shell p-2 p-md-4'>
      <Container fluid className='app-panel rounded-4 p-2 p-md-3'>

        <Titre
          rapportLe={rapportLe}
          setRapportLe={setRapportLe}
        />

        <Formulaire
          sites={sites}
          nom_detecteur={nom_detecteur}
          stock_detecteur={stock_detecteur}
          setStockdetecteur={setStockdetecteur}
          stock_sites={stock_sites}
          setStocksite={setStocksite}
          setAllstock={setAllstock}
          rapportLe={rapportLe}
          setTitreExport={setTitreExport}
          isFinish={isFinish}
          setIsfinish={setIsfinish}
          isEdit = {isEdit}
           setIsEdit={setIsEdit}
            allStock={allStock}
            idModif={idModif}
        />

        <Liste
          allStock={allStock}
          titre_export={titre_export}
          responsables={responsables}
          setStocksite={setStocksite}
          setStockdetecteur={setStockdetecteur}
          setTitreExport={setTitreExport}
          setAllstock={setAllstock}
          setRapportLe={setRapportLe}
          setIsfinish={setIsfinish}
          rapportLe={rapportLe}
          setIsEdit={setIsEdit}
            stock_sites={stock_sites}
            stock_detecteur={stock_detecteur}
            setIdModfi={setIdModfi}
            onReportExport={handleReportExport}
           
        />

      </Container>
      </section>
    </main>
  )
}

export default App
