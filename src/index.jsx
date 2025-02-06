const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())


morgan.token('body', req => {
    if (req.body === {}) req.body = null
    return JSON.stringify(req.body) || "no-content"
})
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.body(req)
    ].join(' ')
}))


let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
    return res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = persons.find(person => person.id === id)
    console.log(person)

    if (person) return res.json(person)

    return res.status(404).end()
})

app.post('/api/persons', (req, res) => {
    const newPerson = req.body
    if (!newPerson) return res.status(400).json({
        error: 'No content'
    })
    if (!newPerson.name) return res.status(400).json({
        error: 'Missing name'
    })
    if (!newPerson.number) return res.status(400).json({
        error: 'Missing number'
    })
    if (persons.find(person => person.name === newPerson.name)) return res.status(400).json({
        error: 'Name already exists'
    })

    const id = Math.floor(Math.random() * 10**4)
    newPerson.id = String(id)
    console.log(newPerson)

    persons = persons.concat(newPerson)

    console.log(persons)

    return res.json(newPerson)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    persons = persons.filter(person => person.id !== id)

    return res.status(204).end()
})

app.get('/info', (req, res) => {
    const time = new Date()
    const body = `<div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${time}</p>
        </div>`
    return res.send(body)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})