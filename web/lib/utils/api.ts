import { ApiResponse } from '../types/common'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetcher<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP Error: ${response.status}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      error
    )
  }
}

export async function postData<T = any>(
  url: string,
  data: any
): Promise<ApiResponse<T>> {
  return fetcher<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getData<T = any>(
  url: string,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  const searchParams = params
    ? '?' + new URLSearchParams(params).toString()
    : ''

  return fetcher<T>(url + searchParams, {
    method: 'GET',
  })
}

export async function deleteData<T = any>(
  url: string
): Promise<ApiResponse<T>> {
  return fetcher<T>(url, {
    method: 'DELETE',
  })
}

// Utility function for handling file uploads
export async function uploadFile(
  url: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<ApiResponse> {
  const formData = new FormData()
  formData.append('file', file)

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value))
    })
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || `Upload failed: ${response.status}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Upload failed',
      undefined,
      error
    )
  }
}

// Retry logic for failed requests
export async function fetchWithRetry<T = any>(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  delay = 1000
): Promise<ApiResponse<T>> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetcher<T>(url, options)
    } catch (error) {
      lastError = error as Error

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError!
}
