require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', req => {
    if (req.body === "{}") req.body = null
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

app.get('/api/persons', (req, res) => {
    Person.find({})
        .then((persons) => {
            res.json(persons)
        })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => {
            if (person) {
                console.log(person)
                res.json(person)
            } else {
                res.status(404).end()
            }
        }).catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
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

 /*   if (person.find(person => person.name === newPerson.name)) return res.status(400).json({
        error: 'Name already exists'
    })
*/
    const person = new Person({
        name: newPerson.name,
        number: newPerson.number,
    })

    console.log(person)

    person.save()
        .then(addedPerson => {
        res.json(addedPerson)
        })
        .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query'}
    )
        .then((updatedPerson) => {
            res.json(updatedPerson)
        })
        .catch((err) => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then((person) => {
            res.status(204).end()
        })
        .catch(err => next(err))
})

app.get('/info', (req, res) => {
    Person.find({})
        .then((persons) => {
            const time = new Date()
            console.log(persons)
            const body = `<div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${time}</p>
        </div>`
            res.send(body)
        })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
}

    next(error)
}
app.use(errorHandler)
