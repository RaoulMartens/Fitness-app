import assert from 'node:assert/strict'
import { fresh, knownAnswers, blankAnswers, decide, validate, validState, nextDate } from '../public/m4-voorstel/model.js'
import { screen } from '../public/m4-voorstel/screens.js'

const known = knownAnswers()
assert.equal(decide(known).view, 'proposal')
assert.equal(known.weekend, 'none')
assert.equal(known.priority, 'none')
assert.equal(decide(blankAnswers()).view, 'goal')
assert.equal(decide({ ...known, minutes: '45' }).view, 'compromise')
assert.equal(decide({ ...known, minutes: '45', weekend: 'za' }).view, 'compromise')
assert.equal(decide({ ...known, minutes: '45', goal: 'strength' }).view, 'compromise')
assert.equal(decide({ ...known, minutes: '60' }).view, 'proposal')
assert.equal(decide({ ...known, place: 'home' }).reason, 'equipment')
assert.equal(decide({ ...known, experience: 'over3' }).reason, 'experience')
assert.equal(decide({ ...known, notes: 'Voorbeeldbeperking' }).reason, 'restriction')
assert.ok(validate({ ...known, day: 'za', weekend: 'za' }, 'week'))
assert.equal(nextDate(known, new Date(2026, 8, 17, 12)), 'woensdag 23 september')
assert.equal(nextDate({ ...known, weekend: 'za' }, new Date(2026, 8, 17, 12)), 'zaterdag 19 september')

const state = fresh()
assert.ok(validState(state))
assert.equal(validState({ ...state, draft: { ...known, minutes: 'fake' } }), false)
assert.equal(validState({ ...state, accepted: { answers: { ...known, minutes: '45' }, at: '2026-09-17' } }), false)
state.accepted = { answers: structuredClone(known), at: '2026-09-17' }
state.draft.minutes = '45'
state.view = 'plan'
assert.ok(validState(state))
assert.equal(state.accepted.answers.minutes, '90')
assert.match(screen(state), /1×/)
state.view = 'unsupported'
state.draft.notes = '<img src=x onerror=alert(1)>'
assert.ok(!screen(state).includes('<img'))
assert.match(screen(state), /&lt;img/)
console.log('M4 checks passed: intake, time conflict, unsupported contexts, distinct days, dates, snapshot preservation, invalid storage and escaped notes.')
