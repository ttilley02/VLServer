const express = require("express");
const cardsService = require("./cards-service");
const { requireAuth } = require("../middleware/jwt-auth");

const cardsRouter = express.Router();
const jsonBodyParser = express.json();

//get all cards no login required.
cardsRouter.route("/").get((req, res, next) => {
  cardsService
    .getAllCards(req.app.get("db"))
    .then((cards) => {
      res.json(cards);
    })
    .catch(next);
});

//get all cards the user has favorited
cardsRouter
  .route("/mycards")
  .all(requireAuth)
  .get((req, res, next) => {
    cardsService
      .getAllUserCards(req.app.get("db"), req.user.id)
      .then((cards) => {
        res.json(cards);
      })
      .catch(next);
  });

//favorite the current card and put in the my cards section
cardsRouter
  .route("/fav/:card_id")
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { favorite, card_id } = req.body;
    const noteToUpdate = { favorite, card_id };
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `must mark as a favorite`,
        },
      });
    }

    noteToUpdate.user_id = req.user.id;

    cardsService
      .favCard(req.app.get("db"), noteToUpdate, req.user.id, card_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = cardsRouter;
