import React, { useState } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import Swal from 'sweetalert2'
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function Liste({
  allStock,
  titre_export,
  responsables,
  setStocksite,
  setStockdetecteur,
  setTitreExport,
  setAllstock,
  setRapportLe,
  setIsfinish,
  isEdit,
  setIsEdit,
  setIdModfi

}) {




  //export en excel onclick
  const handleExortExcel = () => {

    Swal.fire({
      title: "Vous etes sur?",
      text: "Ces données seront exportés en Excel",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Non",
      confirmButtonText: "Oui"
    }).then((result) => {
      if (result.isConfirmed) {

        exportExcel()

        Swal.fire({
          title: "Exportaion reussi!",
          icon: "success",
          draggable: true
        });
        setStocksite("")
        setStockdetecteur("")
        setTitreExport("Rapport")
        setAllstock([])
        // setRapportLe("")
        setIsfinish(false)
      }
    });




  }

  // Exportation en Excel function
  const exportExcel = async () => {
    // Vérifier s'il existe des données
    if (!allStock || allStock.length < 1) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Aucune donnée à exporter",
      });

      return;
    }

    // Préparer les données à exporter
    const donneesExcel = allStock.map((e, i) => ({
      Acct: e.acct || "",
      CallNO: e.numeros ? String(e.numeros) : "",
      Detector: e.detct || "",
      AlarmInfo: responsables[i] || "",
      AlarmTime: e.date ? e.date.replace("T", " ") : "",
      HandleRemark: "",
    }));

    // Créer le classeur Excel
    const workbook = new ExcelJS.Workbook();

    // Créer la feuille Excel
    const worksheet = workbook.addWorksheet("Rapports");

    // Configuration de l'impression sur une seule page
    worksheet.properties.pageSetUpPr = {
      fitToPage: true,
      autoPageBreaks: false,
    };

    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalDpi: 300,
      verticalDpi: 300,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    };

    // Définir les colonnes
    worksheet.columns = [
      {
        header: "Acct",
        key: "Acct",
        width: 12,
      },
      {
        header: "CallNO",
        key: "CallNO",
        width: 20,
      },
      {
        header: "Detector",
        key: "Detector",
        width: 15,
      },
      {
        header: "AlarmInfo",
        key: "AlarmInfo",
        width: 40,
      },
      {
        header: "AlarmTime",
        key: "AlarmTime",
        width: 25,
      },
      {
        header: "HandleRemark",
        key: "HandleRemark",
        width: 30,
      },
    ];

    // Ajouter les données
    donneesExcel.forEach((ligne) => {
      worksheet.addRow(ligne);
    });

    // Définir la zone d'impression
    worksheet.printArea = `A1:F${worksheet.rowCount}`;

    // Style général des cellules
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "thin",
            color: { argb: "FF000000" },
          },
          bottom: {
            style: "thin",
            color: { argb: "FF000000" },
          },
          left: {
            style: "thin",
            color: { argb: "FF000000" },
          },
          right: {
            style: "thin",
            color: { argb: "FF000000" },
          },
        };
      });
    });

    // Style de l'en-tête
    const ligneEntete = worksheet.getRow(1);

    ligneEntete.height = 30;

    ligneEntete.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 12,
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.border = {
        top: {
          style: "thin",
          color: { argb: "FF000000" },
        },
        bottom: {
          style: "thin",
          color: { argb: "FF000000" },
        },
        left: {
          style: "thin",
          color: { argb: "FF000000" },
        },
        right: {
          style: "thin",
          color: { argb: "FF000000" },
        },
      };
    });

    // Hauteur des lignes de données
    for (let i = 2; i <= worksheet.rowCount; i++) {
      worksheet.getRow(i).height = 25;
    }

    // Figer la première ligne
    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // Préparer le fichier Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Nettoyer le nom du fichier
    // Nettoyer le nom du fichier
    let nomFichier = titre_export || "Rapport";

    // Supprimer l'heure après la date
    // Exemple : 2026-09-16T19_14 devient 2026-09-16
    nomFichier = nomFichier.replace(/(\d{4}-\d{2}-\d{2})T.*/, "$1");

    nomFichier = nomFichier
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, " ")
      .trim();

    // Télécharger le fichier
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${nomFichier}.xlsx`
    );
  };

  const handleSuppr = (id) => {
    Swal.fire({
      title: "Vous etes sur?",
      text: "Cet element sera supprimé",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Non",
      confirmButtonText: "Oui"
    }).then((result) => {
      if (result.isConfirmed) {
        const newStock = allStock.filter((e, b) => b !== id)
        Swal.fire({
          title: "Suppression reussi!",
          icon: "success",
          draggable: true
        });
        setAllstock(newStock)

      }
    })
  }

  const handleEdit = (id) => {
    setIdModfi(id)
    setIsfinish(true)
    setIsEdit(true)
    allStock.map((e, i) => {
      if (i === id) {
        setStocksite(e.nom)
        setStockdetecteur(e.detct)
        setRapportLe(e.date)
      }
    })

  }



  return (
    <Row className="mt-3">
      <Col>

        <div className='bg-dark p-2' style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h5 className=' text-white '>Titre : {titre_export.replace(/T\d{2}([:_])\d{2}.*$/, "")}</h5>
          <Button disabled={allStock.length == 0} variant='success' style={{ cursor: "pointer" }} onClick={handleExortExcel}> Exporter en Ecxel</Button></div>

        <div style={{ maxHeight: "176px ", overflowY: "scroll", scrollbarWidth: "thin" }}>
          <div className=' table-responsive'>
            <table className="table table-bordered table-hover table-striped ">
              <thead>
                <tr>
                  <th>Acct</th>
                  <th>CallNO</th>
                  <th>Detector</th>
                  <th>AlarmInfo</th>
                  <th>AlarmTime</th>
                  <th>HandleRemark</th>
                  <th>Action</th>


                </tr>
              </thead>

              <tbody>
                {allStock.length === 0 ? (<tr><td className='text-center text-danger' colSpan={7}>Aucun element</td></tr>) : allStock.map((e, b) => (
                  <tr key={b}>

                    <td>{e.acct}</td>

                    <td>{e.numeros}</td>

                    <td className="text-uppercase">
                      {e.detct}
                    </td>

                    <td>
                      {responsables[b]} (SMS)
                    </td>

                    <td>
                      {e.date.replace("T", "  ")}
                    </td>

                    <td></td>
                    <td className='d-flex gap-2'>
                      <Button variant='danger' onClick={() => handleSuppr(b)}><i className="bi bi-trash"></i></Button>
                      <Button  variant='success text-white' onClick={() => handleEdit(b)}><i className="bi bi-pencil-square"></i></Button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </Col>
    </Row>
  )
}

export default Liste