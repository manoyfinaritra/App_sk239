import axios from "axios";

const hostname = window.location.hostname;
const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "";

const Api = axios.create({
    // Détection auto local / InfinityFree
    // Local (htdocs) : http://localhost/App_sk239/
    // Prod : https://ctmmds.infinityfree.me/
    baseURL: isLocal
        ? "http://localhost/App_sk239/backend/"
        : "/backend/", // InfinityFree
})


export default Api
