import { getAccessToken } from './auth';

const API_URL = 'http://localhost:8000/api';

export interface FetchOptions extends RequestInit {
  queryParams?: Record<string, string | number | boolean>;
}

export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data: T; status: number; ok: boolean; error?: string }> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Safely merge existing headers if they're a plain object
    if (options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${API_URL}${endpoint}`;
    
    // Add query parameters
    if (options.queryParams) {
      const params = new URLSearchParams();
      Object.entries(options.queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Handle unauthorized - clear tokens and trigger logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth_unauthorized'));
      }
    }

    const data = await response.json().catch(() => ({}));

    return {
      data: data as T,
      status: response.status,
      ok: response.ok,
      error: !response.ok ? data.detail || `API Error: ${response.statusText}` : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      data: {} as T,
      status: 0,
      ok: false,
      error: message,
    };
  }
}

// Course APIs
export function getCourses(filters?: {
  status?: number;
  visibility?: number;
  search?: string;
}) {
  const queryParams: Record<string, string | number | boolean> = {
    status: filters?.status ?? 2, // Default to published
    visibility: filters?.visibility ?? 1, // Default to public
  };
  
  if (filters?.search) {
    queryParams.search = filters.search;
  }
  
  return apiCall<any[]>('/courses/', { queryParams });
}

export function getCourseById(id: number) {
  return apiCall<any>(`/courses/${id}/`);
}

// Enrollment APIs
export function enrollCourse(courseId: number) {
  return apiCall<any>('/enrollments/', {
    method: 'POST',
    body: JSON.stringify({
      course: courseId,
      status: 1, // Enrolled status
    }),
  });
}

export function getUserEnrollments(filters?: {
  userId?: number;
  courseId?: number;
  status?: number;
}) {
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (filters?.userId) {
    queryParams.user = filters.userId;
  }
  if (filters?.courseId) {
    queryParams.course = filters.courseId;
  }
  if (filters?.status) {
    queryParams.status = filters.status;
  }
  
  return apiCall<any[]>('/enrollments/', { queryParams });
}

export function getEnrollmentDetail(enrollmentId: number) {
  return apiCall<any>(`/enrollments/${enrollmentId}/detail/`);
}

// User Progress APIs
export function getUserProgress(filters?: {
  userId?: number;
  courseId?: number;
}) {
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (filters?.userId) {
    queryParams.user = filters.userId;
  }
  if (filters?.courseId) {
    queryParams.course = filters.courseId;
  }
  
  return apiCall<any[]>('/user-progress/', { queryParams });
}

export function updateUserProgress(progressId: number, status: number) {
  return apiCall<any>(`/user-progress/${progressId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Quiz Attempt APIs
export function getQuizAttempts(filters?: {
  userId?: number;
  courseId?: number;
}) {
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (filters?.userId) {
    queryParams.user = filters.userId;
  }
  if (filters?.courseId) {
    queryParams.course = filters.courseId;
  }
  
  return apiCall<any[]>('/quiz-attempts/', { queryParams });
}
