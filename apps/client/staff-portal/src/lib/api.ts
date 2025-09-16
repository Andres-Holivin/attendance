// lib/axios.ts
import axios from "axios";

export enum APIUrlEnum {
    USER_API,
    ATTENNDANCE_API
}
function APIUrl(url: APIUrlEnum) {
    let apiUrl = "";
    switch (url) {
        case APIUrlEnum.USER_API:
            apiUrl = process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:3001"
            break;
        case APIUrlEnum.ATTENNDANCE_API:
            apiUrl = process.env.NEXT_PUBLIC_ATTENDANCE_API_URL || "http://localhost:5000"
            break;
        default:
            apiUrl = process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:3001"
    }
    return apiUrl;
}

export function API(url: APIUrlEnum) {
    const apiUrl = APIUrl(url);
    const api = axios.create({
        baseURL: apiUrl,
        withCredentials: true, // 🔑 important for cookies
        headers: {
            "Content-Type": "application/json",
        },
    });
    return api;
}
