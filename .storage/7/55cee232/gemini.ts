export interface ProductData {
  productName: string;
  description: string;
  imageUrl: string;
}

export const extractProductData = async (url: string): Promise<ProductData> => {
  try {
    // First, fetch the HTML content of the URL
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch URL content');
    }

    const data = await response.json();
    const htmlContent = data.contents;

    // Prepare the Gemini API request
    const systemInstruction = `Act as a helpful product expert. When given a URL, extract the product name, a concise summary of the product's features and description (less than 100 words), and a URL for the main product image. Respond with a valid JSON object only.`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `System: ${systemInstruction}\n\nUser: Extract product information from this HTML content:\n\n${htmlContent}`
            }
          ]
        }
      ]
    };

    // Make request to Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY || 'demo-key'}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiPayload)
      }
    );

    if (!geminiResponse.ok) {
      throw new Error('Gemini API request failed');
    }

    const geminiResult = await geminiResponse.json();
    const generatedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const productData = JSON.parse(cleanedText);

    // Validate the response structure
    if (!productData.productName || !productData.description || !productData.imageUrl) {
      throw new Error('Invalid AI response format');
    }

    return productData;
  } catch (error) {
    console.error('Error extracting product data:', error);
    
    // Fallback: Try to extract basic info from the URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    return {
      productName: `Product from ${domain}`,
      description: `Product found at ${domain}. Please check the original URL for full details.`,
      imageUrl: '/placeholder-product.jpg'
    };
  }
};