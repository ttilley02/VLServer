const express = require('express')
const path = require("path");
const cardsService = require('./cards-service')
const { requireAuth } = require('../middleware/jwt-auth')



const cardsRouter = express.Router()
const jsonBodyParser = express.json();

cardsRouter
  .route('/')
  .get((req, res, next) => {
    cardsService.getAllCards(req.app.get('db'))
      .then(cards => {
        res.json(cards)
      })
      .catch(next)
  })

cardsRouter
.route('/mycards')
.all(requireAuth)
.get((req, res, next) => {
  
  cardsService.getAllUserCards(req.app.get('db'), req.user.id)
    .then(cards => {
      res.json(cards)
    })
    .catch(next)
})

cardsRouter
.route('/fav/:card_id')
.post(requireAuth , jsonBodyParser, (req, res, next) => {
  const { favorite, card_id } = req.body
  const noteToUpdate = { favorite, card_id }
  const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `must mark as a favorite`
        }
      })
    }

    noteToUpdate.user_id = req.user.id;  
    
  cardsService.favCard(
    req.app.get('db'),
    noteToUpdate,
    req.user.id,
    card_id
  )
    .then(() => {
      res.status(204).end()
    })
    .catch(next)
})


// cardsRouter
//   .route('/:card_id')
//   .all(requireAuth)
//   .all(checkCardExists)
//   .get((req, res) => {
//     res.json(res.card)
//   })
 

/* async/await syntax for promises */
async function checkCardExists(req, res, next) {
  try {
    const card = await cardsService.getById(
      req.app.get('db'),
      req.params.card_id
    )

    if (!card)
      return res.status(404).json({
        error: `card doesn't exist`
      })

    res.card = card
    next()
  } catch (error) {
    next(error)
  }
}


module.exports = cardsRouter
