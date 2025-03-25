import axios from 'axios'
import Freight from '../model/corefreight.js'

export const fetchFreightData = async () => {
    // Log the environment variable to debug
    console.log('EXTERNAL_CORE:', process.env.EXTERNAL_CORE);
    
    try {
        // Ensure the URL is fully formed
        const baseUrl = process.env.EXTERNAL_CORE?.trim() || 'https://backend-core1.axleshift.com';
        const fullUrl = `${baseUrl}/api/v1/freight/`;
        
        console.log('Full URL:', fullUrl);
        console.log('API Token:', process.env.CORE_API_TOKEN);

        const response = await axios.post(fullUrl, 
            { page: 1 },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CORE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Process and save each freight item
        const freights = response.data.map(freightData => ({
            user_id: freightData.user_id,
            is_import: freightData.is_import,
            is_residential_address: freightData.is_residential_address,
            contains_danger_goods: freightData.contains_danger_goods,
            contains_documents: freightData.contains_documents,
            type: freightData.type,
            status: freightData.status,
            courier: freightData.courier,
            total_weight: freightData.total_weight,
            number_of_items: freightData.number_of_items,
            amount: {
                currency: freightData.amount.currency,
                value: freightData.amount.value
            },
            expected_delivery_date: freightData.expected_delivery_date,
            country: freightData.country,
            session_id: freightData.session_id,
            tracking_number: freightData.tracking_number
        }));

        // Bulk insert or update
        await Freight.bulkWrite(
            freights.map(freight => ({
                updateOne: {
                    filter: { tracking_number: freight.tracking_number },
                    update: freight,
                    upsert: true
                }
            }))
        );

        return freights;
    } catch (error) {
        console.error('Error fetching freight data:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export default {
    fetchFreightData
};