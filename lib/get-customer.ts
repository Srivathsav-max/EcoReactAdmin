import axios from 'axios';

interface CustomerData {
  id: string;
  storeId: string;
  email: string;
  name?: string;
}

export const getCurrentCustomer = async (domain: string): Promise<CustomerData | null> => {
  try {
    console.log('Fetching customer profile for domain:', domain);
    const response = await axios.get(`/api/auth/customer/profile?domain=${domain}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Customer profile response:', response.data);
    
    if (response.data?.success && response.data?.data?.id && response.data?.data?.storeId) {
      const customerData: CustomerData = {
        id: response.data.data.id,
        storeId: response.data.data.storeId,
        email: response.data.data.email,
        name: response.data.data.name
      };
      console.log('Returning customer data:', customerData);
      return customerData;
    }
    
    console.log('No valid customer data:', response.data);
    return null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
};
