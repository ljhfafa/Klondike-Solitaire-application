"use strict";

const shuffleCards = (includeJokers = false) => {
  let cards = [];
  ["spades", "clubs", "hearts", "diamonds"].forEach((suit) => {
    ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"].forEach(
      (value) => {
        cards.push({ suit: suit, value: value });
      }
    );
  });

  if (includeJokers) {
    cards.push({ suit: "joker", value: "black" });
    cards.push({ suit: "joker", value: "red" });
  }

  let deck = [];
  while (cards.length > 0) {
    const index = Math.floor(Math.random() * cards.length);
    deck.push(cards[index]);
    cards.splice(index, 1);
  }
  return deck;
};

const initialState = () => {
  let state = {
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: [],
  };

  const deck = shuffleCards(false);

  for (let i = 1; i <= 7; ++i) {
    let card = deck.splice(0, 1)[0];
    card.up = true;
    state[`pile${i}`].push(card);
    for (let j = i + 1; j <= 7; ++j) {
      card = deck.splice(0, 1)[0];
      card.up = false;
      state[`pile${j}`].push(card);
    }
  }

  state.draw = deck.map((card) => {
    card.up = false;
    return card;
  });

  return state;
};

const filterGameForProfile = (game) => ({
  active: game.active,
  score: game.score,
  won: game.won,
  id: game._id,
  game: "klondyke",
  start: game.start,
  state: game.state,
  moves: game.moves,
  winner: game.winner,
});

const filterMoveForResults = (move) => ({
  ...move,
});

const getCardValue = (value) => {
  if (value === "ace") return 1;
  if (value === "jack") return 11;
  if (value === "queen") return 12;
  if (value === "king") return 13;
  return parseInt(value, 10);
};

const getCardColor = (suit) => {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
};

const checkGameWin = (state) => {
  const foundationPiles = ["stack1", "stack2", "stack3", "stack4"];
  return foundationPiles.every((pile) => {
    const cards = state[pile];
    return (
      cards.length === 13 &&
      cards[12].value === "king" &&
      cards.every(
        (card, i) =>
          i === 0 ||
          (card.suit === cards[0].suit &&
            getCardValue(card.value) === getCardValue(cards[i - 1].value) + 1)
      )
    );
  });
};

const validateMove = async (currentState, move, gameConfig) => {
  try {
    const { src, dst, cards } = move;

    if (!src || !dst) return null;

    const newState = JSON.parse(JSON.stringify(currentState));
    const sourcePile = newState[src];
    const destPile = newState[dst];

    if (!sourcePile || !destPile) return null;

    if (dst === "discard" && src !== "draw") return null;

    if (src === "draw" && dst === "discard") {
      if (sourcePile.length === 0) {
        if (destPile.length === 0) return null;
        newState.draw = [...destPile]
          .reverse()
          .map((card) => ({ ...card, up: false }));
        newState.discard = [];
        return newState;
      }

      const drawCount = gameConfig?.draw === "Draw 3" ? 3 : 1;
      const cardsToMove = sourcePile.slice(
        -Math.min(drawCount, sourcePile.length)
      );
      cardsToMove.forEach((card) => (card.up = true));

      newState.draw = sourcePile.slice(0, -cardsToMove.length);
      newState.discard = [...destPile, ...cardsToMove];
      return newState;
    }

    if (!cards || !Array.isArray(cards) || cards.length === 0) return null;

    let sourceIndex = -1;
    let cardsToMove;

    if (src === "discard") {
      if (cards.length !== 1) return null;
      const topCard = sourcePile[sourcePile.length - 1];
      if (
        !topCard ||
        cards[0].suit !== topCard.suit ||
        cards[0].value !== topCard.value
      )
        return null;
      cardsToMove = [topCard];
      sourceIndex = sourcePile.length - 1;
    } else {
      sourceIndex = sourcePile.findIndex(
        (card) =>
          card &&
          cards[0] &&
          card.suit === cards[0].suit &&
          card.value === cards[0].value
      );
      if (sourceIndex === -1) return null;
      cardsToMove = sourcePile.slice(sourceIndex);
      if (cardsToMove.some((card) => !card.up)) return null;
    }

    if (dst.startsWith("stack")) {
      if (cards.length !== 1) return null;
      const card = cards[0];

      if (destPile.length === 0) {
        if (card.value !== "ace") return null;
      } else {
        const topCard = destPile[destPile.length - 1];
        if (
          !topCard ||
          card.suit !== topCard.suit ||
          getCardValue(card.value) !== getCardValue(topCard.value) + 1
        ) {
          return null;
        }
      }
    } else if (dst.startsWith("pile")) {
      const card = cards[0];

      if (destPile.length === 0) {
        if (card.value !== "king") return null;
      } else {
        const topCard = destPile[destPile.length - 1];
        if (
          !topCard ||
          !topCard.up ||
          getCardColor(card.suit) === getCardColor(topCard.suit) ||
          getCardValue(card.value) + 1 !== getCardValue(topCard.value)
        ) {
          return null;
        }
      }

      if (cards.length > 1) {
        for (let i = 0; i < cards.length - 1; i++) {
          const curr = cards[i];
          const next = cards[i + 1];
          if (!curr || !next) return null;
          if (getCardColor(curr.suit) === getCardColor(next.suit)) return null;
          if (getCardValue(curr.value) !== getCardValue(next.value) + 1)
            return null;
        }
      }
    }

    newState[src] = sourcePile.slice(0, sourceIndex);
    newState[dst] = [...destPile, ...cardsToMove];

    if (src.startsWith("pile") && newState[src].length > 0) {
      newState[src][newState[src].length - 1].up = true;
    }

    if (checkGameWin(newState)) {
      newState.won = true;
    }

    return newState;
  } catch (error) {
    console.error("Move validation error:", error);
    return null;
  }
};

module.exports = {
  shuffleCards,
  initialState,
  filterGameForProfile,
  filterMoveForResults,
  validateMove,
  checkGameWin,
};
