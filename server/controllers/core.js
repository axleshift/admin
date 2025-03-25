import axios from 'axios';

const core1 = process.env.EXTERNAL_CORE?.replace(/\/$/, '');
const core1Token = process.env.CORE_API_TOKEN;

export const fetchCore1Data = async (req, res) => {
  try {
    console.log('Fetching data from External Core API...');

    const page = req.query.page || 1;

    const response = await axios.post(
      `${core1}/api/v1/freight/`,
      { page },
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Full Response:', JSON.stringify(response.data, null, 2));

    // Return the entire response data
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching freight data:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Failed to fetch data',
        details: error.response.data,
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response from API' });
    } else {
      return res.status(500).json({ error: error.message });
    }
  }
};
