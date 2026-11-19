import { describe, expect, it } from 'vitest'
import baza from './przepisy.json'
import { dopasujPrzepisy } from './lodowka.js'

describe('dopasowanie przepisów do lodówki', () => {
  it('jajka + cebula + mleko → omlet na początku', () => {
    const w = dopasujPrzepisy(baza.przepisy, ['jajka', 'cebula', 'mleko'])
    expect(w[0].p.id).toBe('omlet-z-cebula')
    expect(w[0].brakuje).toEqual([])
  })
  it('makaron + pomidory z puszki + czosnek → makaron pomidorowy', () => {
    const ids = dopasujPrzepisy(baza.przepisy, ['makaron', 'pomidory z puszki', 'czosnek']).map((w) => w.p.id)
    expect(ids).toContain('makaron-pomidorowy')
  })
  it('pusta lodówka → nic', () => expect(dopasujPrzepisy(baza.przepisy, [])).toEqual([]))
})
