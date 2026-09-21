import { useEffect, useState } from "react";
import { Button, Form, Table, Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import Api from "./Api";

function Administration({ onSitesChanged }) {

    const [sites, setSites] = useState([]);

    const [acct, setAcct] = useState("");
    const [nom, setNom] = useState("");
    const [numeros, setNumeros] = useState("");
    const [da, setDa] = useState("");
    const [sa, setSa] = useState("");
    const [ccl, setCcl] = useState("");

    // Site actuellement en modification
    const [siteEdit, setSiteEdit] = useState(null);

    const [showModal, setShowModal] = useState(false);


    // ============================================================
    // RECUPERER LES SITES
    // ============================================================

    const getSites = () => Api.get("data.php", { params: { action: "getSites" } })
        .then((response) => {
            if (response.data.success) setSites(response.data.sites);
            else throw new Error(response.data.message || "Impossible de récupérer les sites.");
        })
        .catch((error) => {
            console.error("Erreur récupération sites :", error);
        });


    // ============================================================
    // CHARGER LES SITES AU DEMARRAGE
    // ============================================================

    useEffect(() => {

        const request = getSites();
        return () => request?.catch(() => {});

    }, []);


    // ============================================================
    // VIDER LE FORMULAIRE
    // ============================================================

    const viderFormulaire = () => {

        setAcct("");
        setNom("");
        setNumeros("");
        setDa("");
        setSa("");
        setCcl("");

    };


    // ============================================================
    // AJOUTER UN SITE
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!acct || !nom) {

            Swal.fire({
                title: "Attention",
                text: "ACCT et Nom du site sont obligatoires",
                icon: "warning"
            });

            return;
        }


        try {

            const response = await Api.post(
                "data.php",
                {
                    action: "addSite",

                    acct: acct,
                    nom: nom,
                    numeros: numeros,
                    da: da,
                    sa: sa,
                    ccl: ccl
                }
            );


            if (response.data.success) {

                Swal.fire({
                    title: "Ajout réussi !",
                    text: "Le site a été ajouté avec succès.",
                    icon: "success"
                });

                viderFormulaire();

                // Actualiser le tableau
                getSites();
                onSitesChanged?.();

            } else {

                Swal.fire({
                    title: "Erreur",
                    text: response.data.message,
                    icon: "error"
                });

            }

        } catch (error) {

            console.error(error);

            Swal.fire({
                title: "Erreur",
                text: "Impossible d'ajouter le site.",
                icon: "error"
            });

        }

    };


    // ============================================================
    // OUVRIR MODIFICATION
    // ============================================================

    const handleEdit = (site) => {

        setSiteEdit(site);

        setAcct(site.acct);
        setNom(site.nom);
        setNumeros(site.numeros);
        setDa(site.da);
        setSa(site.sa);
        setCcl(site.ccl);

        setShowModal(true);

    };


    // ============================================================
    // MODIFIER LE SITE
    // ============================================================

    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

            const response = await Api.post(
                "data.php",
                {
                    action: "updateSite",

                    id: siteEdit.id,

                    acct: acct,
                    nom: nom,
                    numeros: numeros,
                    da: da,
                    sa: sa,
                    ccl: ccl
                }
            );


            if (response.data.success) {

                Swal.fire({
                    title: "Modification réussie !",
                    icon: "success"
                });

                setShowModal(false);

                viderFormulaire();

                setSiteEdit(null);

                getSites();
                onSitesChanged?.();

            } else {

                Swal.fire({
                    title: "Erreur",
                    text: response.data.message,
                    icon: "error"
                });

            }

        } catch (error) {

            console.error(error);

            Swal.fire({
                title: "Erreur",
                text: "Impossible de modifier le site.",
                icon: "error"
            });

        }

    };


    // ============================================================
    // SUPPRIMER UN SITE
    // ============================================================

    const handleDelete = async (id) => {

        const result = await Swal.fire({

            title: "Supprimer ce site ?",

            text: "Cette action est irréversible.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText: "Oui, supprimer",

            cancelButtonText: "Annuler"

        });


        if (!result.isConfirmed) {
            return;
        }


        try {

            const response = await Api.post(
                "data.php",
                {
                    action: "deleteSite",
                    id: id
                }
            );


            if (response.data.success) {

                Swal.fire({
                    title: "Supprimé !",
                    text: "Le site a été supprimé.",
                    icon: "success"
                });

                getSites();
                onSitesChanged?.();

            } else {

                Swal.fire({
                    title: "Erreur",
                    text: response.data.message,
                    icon: "error"
                });

            }

        } catch (error) {

            console.error(error);

            Swal.fire({
                title: "Erreur",
                text: "Impossible de supprimer le site.",
                icon: "error"
            });

        }

    };


    return (

        <div className="container-fluid administration-page p-4">


            {/* ==================================================
                            TITRE
            ================================================== */}

            <div className="mb-4">

                <h3 className="text-light fw-bold">
                    <i className="bi bi-gear me-2"></i>
                    Administration des sites
                </h3>

                <p className=" text-sm text-secondary">
                    Ajouter, modifier ou supprimer les sites.
                </p>

            </div>



            {/* ==================================================
                        FORMULAIRE AJOUT
            ================================================== */}

            <div className="card shadow-sm mb-4">

                <div className="card-header">

                    <h5 className="mb-0 text-light">
                        <i className="bi bi-plus-circle me-2"></i>
                        Ajouter un nouveau site
                    </h5>

                </div>


                <div className="card-body">

                    <Form onSubmit={handleSubmit}>

                        <div className="row">


                            {/* ACCT */}

                            <div className="col-md-2 mb-3">

                                <Form.Label>
                                    ACCT
                                </Form.Label>

                                <Form.Control
                                    type="number"
                                    value={acct}
                                    onChange={(e) =>
                                        setAcct(e.target.value)
                                    }
                                    placeholder="Ex: 311"
                                />

                            </div>


                            {/* NOM */}

                            <div className="col-md-5 mb-3">

                                <Form.Label>
                                    Nom du site
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={nom}
                                    onChange={(e) =>
                                        setNom(e.target.value)
                                    }
                                    placeholder="Nom du site"
                                />

                            </div>


                            {/* NUMERO */}

                            <div className="col-md-5 mb-3">

                                <Form.Label>
                                    Numéro
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={numeros}
                                    onChange={(e) =>
                                        setNumeros(e.target.value)
                                    }
                                    placeholder="+261..."
                                />

                            </div>


                            {/* DA */}

                            <div className="col-md-4 mb-3">

                                <Form.Label>
                                    DA
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={da}
                                    onChange={(e) =>
                                        setDa(e.target.value)
                                    }
                                    placeholder="Ex: Mme LINA"
                                />

                            </div>


                            {/* SA */}

                            <div className="col-md-4 mb-3">

                                <Form.Label>
                                    SA
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={sa}
                                    onChange={(e) =>
                                        setSa(e.target.value)
                                    }
                                    placeholder="Ex: Mr ROJO"
                                />

                            </div>


                            {/* CCL */}

                            <div className="col-md-4 mb-3">

                                <Form.Label>
                                    CCL
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={ccl}
                                    onChange={(e) =>
                                        setCcl(e.target.value)
                                    }
                                    placeholder="Ex: Mme ARISOA"
                                />

                            </div>

                        </div>


                        <Button
                            type="submit"
                            variant="primary"
                        >

                            <i className="bi bi-plus-lg me-2"></i>

                            Ajouter le site

                        </Button>

                    </Form>

                </div>

            </div>



            {/* ==================================================
                        TABLEAU DES SITES
            ================================================== */}

            <div className="card shadow-sm">

                <div className="card-header">

                    <h5 className="mb-0 text-light">

                        <i className="bi bi-table me-2"></i>

                        Liste des sites

                        <span className="badge bg-secondary ms-2">
                            {sites.length}
                        </span>

                    </h5>

                </div>


                <div className="card-body p-0">

                    <div className="table-responsive">

                        <Table
                            striped
                            bordered
                            hover
                            className="mb-0 admin-sites-table"
                        >

                            <thead>

                                <tr>

                                  
                                    <th>ACCT</th>
                                    <th>Site</th>
                                    <th>Numéro</th>
                                    <th>DA</th>
                                    <th>SA</th>
                                    <th>CCL</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {sites.length > 0 ? (

                                    sites.map((site) => (

                                        <tr key={site.id}>

                                            

                                            <td>
                                                {site.acct}
                                            </td>

                                            <td>
                                                {site.nom}
                                            </td>

                                            <td>
                                                {site.numeros}
                                            </td>

                                            <td>
                                                {site.da || "-"}
                                            </td>

                                            <td>
                                                {site.sa || "-"}
                                            </td>

                                            <td>
                                                {site.ccl || "-"}
                                            </td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(site)
                                                        }
                                                    >

                                                        <i className="bi bi-pencil"></i>

                                                    </Button>


                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(site.id)
                                                        }
                                                    >

                                                        <i className="bi bi-trash"></i>

                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="text-center p-4"
                                        >

                                            Aucun site enregistré.

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </Table>

                    </div>

                </div>

            </div>



            {/* ==================================================
                            MODAL MODIFICATION
            ================================================== */}

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
                centered
            >

                <Modal.Header closeButton>

                    <Modal.Title>
                        <i className="bi bi-pencil-square me-2"></i>
                        Modifier le site
                    </Modal.Title>

                </Modal.Header>


                <Form onSubmit={handleUpdate}>

                    <Modal.Body>

                        <div className="row">


                            <div className="col-md-3  mb-3">

                                <Form.Label className="fw-bold text-secondary">
                                    ACCT
                                </Form.Label>

                                <Form.Control
                                    type="number"
                                    value={acct}
                                    onChange={(e) =>
                                        setAcct(e.target.value)
                                    }
                                />

                            </div>


                            <div className="col-md-9 mb-3">

                                <Form.Label className="fw-bold text-secondary">
                                    Nom du site
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={nom}
                                    onChange={(e) =>
                                        setNom(e.target.value)
                                    }
                                />

                            </div>


                            <div className="col-md-12 mb-3">

                                <Form.Label className="fw-bold text-secondary">
                                    Numéro
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={numeros}
                                    onChange={(e) =>
                                        setNumeros(e.target.value)
                                    }
                                />

                            </div>


                            <div className="col-md-4 mb-3">

                                <Form.Label className="fw-bold text-secondary">
                                    DA
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={da}
                                    onChange={(e) =>
                                        setDa(e.target.value)
                                    }
                                />

                            </div>


                            <div className="col-md-4 mb-3">

                                <Form.Label className="fw-bold text-secondary">
                                    SA
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={sa}
                                    onChange={(e) =>
                                        setSa(e.target.value)
                                    }
                                />

                            </div>


                            <div className="col-md-4 mb-3">

                                <Form.Label className="fw-bold text-secondary">
                                    CCL
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    value={ccl}
                                    onChange={(e) =>
                                        setCcl(e.target.value)
                                    }
                                />

                            </div>

                        </div>

                    </Modal.Body>


                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={() =>
                                setShowModal(false)
                            }
                        >

                            Annuler

                        </Button>


                        <Button
                            variant="primary"
                            type="submit"
                        >

                            <i className="bi bi-check-lg me-2"></i>

                            Enregistrer

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </div>

    );

}

export default Administration;
