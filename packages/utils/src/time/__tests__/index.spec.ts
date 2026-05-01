import { describe, it, expect } from 'vitest'
import { getNow } from '../index'

describe('getNow', () => {
  it('should return the current time', () => {
    expect(getNow()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })
})
