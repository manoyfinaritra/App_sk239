import axios from "axios";

const Api = axios.create({
    // Le dossier `App_sk239` est placé dans le serveur PHP local (htdocs).
    // baseURL : "https://ctmmds.infinityfree.me/"
     baseURL : "http://localhost/App_sk239/"

})


export default Api
