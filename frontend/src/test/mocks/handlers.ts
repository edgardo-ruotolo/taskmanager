import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:5000'

export const handlers = [
  http.get(`${BASE_URL}/api/auth/me`, () => {
    return HttpResponse.json(null, { status: 401 })
  }),
  http.post(`${BASE_URL}/api/auth/login`, () => {
    return HttpResponse.json({ message: 'ok' }, { status: 200 })
  }),
]
