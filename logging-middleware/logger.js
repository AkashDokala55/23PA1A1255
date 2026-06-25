import axios from "axios";
const LOG_API = "http://20.244.186.213/evaluation-service/logs";
export async function Log(stack, level, packageName, message, token) {
    try {
        const response = await axios.post(
            LOG_API,
            {
                stack,
                level,
                package: packageName,
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Logging Failed:", error.message);
    }
}
