// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateRequest = (request: any, requiredFields: string[]) => {
  const missingFields = requiredFields.filter((field) => !request[field])

  if (missingFields.length > 0) {
    return `Missing fields: ${missingFields.join(', ')}`
  }

  return null
}

export const removeSpaces = (str: string) => str.replace(/\s/g, '')
