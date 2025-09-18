// lib/axios.ts
import axios from "axios";

export enum APIUrlEnum {
    USER_API,
    ATTENDANCE_API,
    LOGGING_API
}
function APIUrl(url: APIUrlEnum) {
    let apiUrl = "";
    switch (url) {
        case APIUrlEnum.USER_API:
            apiUrl = process.env.NEXT_PUBLIC_USER_API_URL
            break;
        case APIUrlEnum.ATTENDANCE_API:
            apiUrl = process.env.NEXT_PUBLIC_ATTENDANCE_API_URL
            break;
        case APIUrlEnum.LOGGING_API:
            apiUrl = process.env.NEXT_PUBLIC_LOGGING_API_URL
            break;
        default:
            apiUrl = process.env.NEXT_PUBLIC_USER_API_URL
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
