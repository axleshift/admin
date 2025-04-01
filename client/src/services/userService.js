import axiosInstance from '../utils/axiosInstance';


export async function getPasswordAnalysis() {
    try {
        const response = await axiosInstance.get('/security/analyze-passwords');
        return response.data;
    } catch (error) {
        console.error('Error fetching password analysis', error);
        return [];
    }
}
