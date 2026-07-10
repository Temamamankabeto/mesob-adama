import axios from "@/lib/axios";

export async function submitFeedback(data: FeedbackFormData) {

    const response = await axios.post(
        "/feedback",
        data
    );

    return response.data;

}