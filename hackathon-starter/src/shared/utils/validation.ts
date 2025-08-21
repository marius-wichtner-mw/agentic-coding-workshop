export const validateUsername = (username: string): string[] => {
  const errors: string[] = []
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required')
  }
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  }
  
  if (username.length > 50) {
    errors.push('Username must be less than 50 characters')
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens')
  }
  
  return errors
}

export const validateGameName = (name: string): string[] => {
  const errors: string[] = []
  
  if (!name || name.trim().length === 0) {
    errors.push('Game name is required')
  }
  
  if (name.length < 2) {
    errors.push('Game name must be at least 2 characters long')
  }
  
  if (name.length > 100) {
    errors.push('Game name must be less than 100 characters')
  }
  
  return errors
}

export const validateGameType = (type: string): string[] => {
  const errors: string[] = []
  const validTypes = ['video_game', 'table_game', 'card_game']
  
  if (!type) {
    errors.push('Game type is required')
  }
  
  if (!validTypes.includes(type)) {
    errors.push('Game type must be one of: video_game, table_game, card_game')
  }
  
  return errors
}

export const validateBase64Image = (imageData: string): string[] => {
  const errors: string[] = []
  
  if (!imageData.startsWith('data:image/')) {
    errors.push('Invalid image format')
  }
  
  // Check if base64 is valid
  try {
    const base64Data = imageData.split(',')[1]
    if (!base64Data) {
      errors.push('Invalid base64 image data')
    }
    
    // Check size (limit to 5MB)
    const sizeInBytes = (base64Data.length * 3) / 4
    if (sizeInBytes > 5 * 1024 * 1024) {
      errors.push('Image size must be less than 5MB')
    }
  } catch {
    errors.push('Invalid base64 image data')
  }
  
  return errors
}