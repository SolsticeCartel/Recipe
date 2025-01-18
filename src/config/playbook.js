export const uploadToPlaybook = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'key': process.env.REACT_APP_IMGBB_API_KEY
      }
    });

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}; 