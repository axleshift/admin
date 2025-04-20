
export const getClientUrl = () => {
    const clientUrl = process.env.NODE_ENV === "development" 
      ? process.env.DEV_URL 
      : process.env.CLIENT_URL;
      
    if (!clientUrl) {
      throw new Error("CLIENT_URL environment variable is not set");
    }
    
    return clientUrl;
  };