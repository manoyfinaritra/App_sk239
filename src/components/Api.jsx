import axios from "axios";

const Api = axios.create({
    // Le dossier `sk239` doit être placé dans le serveur PHP local (ex. htdocs).
    baseURL : "https://ctmmds.infinityfree.me/"

})


export default Api
