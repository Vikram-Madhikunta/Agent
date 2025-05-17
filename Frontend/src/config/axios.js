import axios from "axios";

// console.log("API URL:", import.meta.env.VITE_API_URL);

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
});

export default axiosInstance;