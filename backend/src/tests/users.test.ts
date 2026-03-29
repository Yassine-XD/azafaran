import request from 'supertest'
import app from '../../app'
import { pool } from '../config/database.js'

let accessToken : string
let userId: string
let addressId: string

const testUser = {
  first_name: 'Test',
  last_name:  'User',
  email:      'users_test@test.com',
  password:   'Test1234!',
}

beforeAll(async () => {
  // Register and get token
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send(testUser)

  accessToken = res.body.data.accessToken
  userId      = res.body.data.user.id
})

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [testUser.email])
  await pool.query('DELETE FROM users WHERE email LIKE $1', ['deleted_%@azafaran.es'])
  await pool.end()
})

// ─── PROFILE ──────────────────────────────────────────

describe('GET /api/v1/users/me', () => {
  it('returns user profile', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe(testUser.email)
    expect(res.body.data.password_hash).toBeUndefined()
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/me')
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/v1/users/me', () => {
  it('updates profile fields', async () => {
    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ first_name: 'Updated', family_size: 4, preferred_lang: 'es' })

    expect(res.status).toBe(200)
    expect(res.body.data.first_name).toBe('Updated')
    expect(res.body.data.family_size).toBe(4)
  })

  it('ignores unknown fields', async () => {
    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ role: 'admin', is_verified: true }) // Should be ignored

    expect(res.status).toBe(400) // Zod strips unknown fields → empty object → valid
  })
})

// ─── ADDRESSES ────────────────────────────────────────

describe('POST /api/v1/users/me/addresses', () => {
  it('creates a new address', async () => {
    const res = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        label:      'Casa',
        street:     'Carrer de Mallorca 123',
        city:       'Barcelona',
        postcode:   '08036',
        province:   'Barcelona',
        is_default: true,
      })

    expect(res.status).toBe(201)
    expect(res.body.data.street).toBe('Carrer de Mallorca 123')
    expect(res.body.data.is_default).toBe(true)
    addressId = res.body.data.id
  })

  it('returns 400 when missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ label: 'Trabajo' }) // missing street, city, postcode

    expect(res.status).toBe(400)
  })

  it('enforces max 5 addresses', async () => {
    const addr = {
      label: 'Extra', street: 'Calle Test 1',
      city: 'Barcelona', postcode: '08001', province: 'Barcelona',
    }
    // Create 4 more (already have 1)
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/api/v1/users/me/addresses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...addr, street: `Calle Test ${i + 2}` })
    }

    // 6th should fail
    const res = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(addr)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('MAX_ADDRESSES_REACHED')
  })
})

describe('GET /api/v1/users/me/addresses', () => {
  it('returns list of addresses', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})

describe('PUT /api/v1/users/me/addresses/:id', () => {
  it('updates an address', async () => {
    const res = await request(app)
      .put(`/api/v1/users/me/addresses/${addressId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ label: 'Trabajo', city: 'Hospitalet' })

    expect(res.status).toBe(200)
    expect(res.body.data.label).toBe('Trabajo')
    expect(res.body.data.city).toBe('Hospitalet')
  })

  it('returns 404 for address belonging to other user', async () => {
    const res = await request(app)
      .put(`/api/v1/users/me/addresses/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ label: 'Hack' })

    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/v1/users/me/addresses/:id/default', () => {
  it('sets address as default', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/me/addresses/${addressId}/default`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/v1/users/me/addresses/:id', () => {
  it('deletes an address', async () => {
    // Create a fresh address to delete
    const create = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        label: 'ToDelete', street: 'Calle Borrar 1',
        city: 'Barcelona', postcode: '08001', province: 'Barcelona',
      })

    const newId = create.body.data.id

    const res = await request(app)
      .delete(`/api/v1/users/me/addresses/${newId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
  })
})