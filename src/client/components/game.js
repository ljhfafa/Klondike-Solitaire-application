"use strict";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Pile } from "./pile.js";

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
`;

const AutoCompleteButton = styled.button`
  padding: 0.5em 1em;
  font-size: 1em;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

export const Game = () => {
  const { id } = useParams();
  const [state, setState] = useState({
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
  });
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);

  const getCardValue = (value) => {
    if (value === "ace") return 1;
    if (value === "jack") return 11;
    if (value === "queen") return 12;
    if (value === "king") return 13;
    return parseInt(value);
  };

  const canMoveToFoundation = (card, foundationTop) => {
    if (!card || !card.up) return false;
    if (!foundationTop) return card.value === "ace";
    return (
      card.suit === foundationTop.suit &&
      getCardValue(card.value) === getCardValue(foundationTop.value) + 1
    );
  };

  const handleAutoComplete = async () => {
    let moved = false;
    const foundations = ["stack1", "stack2", "stack3", "stack4"];
    const sources = [
      "discard",
      "pile1",
      "pile2",
      "pile3",
      "pile4",
      "pile5",
      "pile6",
      "pile7",
    ];

    for (const source of sources) {
      if (!state[source] || state[source].length === 0) continue;

      const topCard = state[source][state[source].length - 1];
      if (!topCard.up) continue;

      for (const foundation of foundations) {
        const foundationPile = state[foundation];
        const foundationTop =
          foundationPile.length > 0
            ? foundationPile[foundationPile.length - 1]
            : null;

        if (canMoveToFoundation(topCard, foundationTop)) {
          try {
            const response = await fetch(`/v1/game/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cards: [topCard],
                src: source,
                dst: foundation,
              }),
            });

            if (response.ok) {
              const newState = await response.json();
              setState(newState);
              moved = true;
              console.log(
                `Moved ${topCard.value} of ${topCard.suit} to foundation`
              );
              break;
            }
          } catch (err) {
            console.log("Auto-complete move failed:", err.message);
          }
        }
      }
      if (moved) break;
    }

    if (!moved) {
      console.log("No valid moves to foundation available");
    }
  };

  useEffect(() => {
    const getGameState = async () => {
      try {
        const response = await fetch(`/v1/game/${id}`);
        const data = await response.json();
        Object.keys(data).forEach((key) => {
          if (Array.isArray(data[key])) {
            data[key] = data[key].map((card) => ({
              suit: card.suit || "unknown",
              value: card.value || "unknown",
              up: !!card.up,
            }));
          }
        });
        setState(data);
      } catch (err) {
        console.log("Failed to fetch game state:", err.message);
      }
    };
    getGameState();
  }, [id]);

  const handleDrawClick = async () => {
    const moveRequest = {
      cards: [],
      src: "draw",
      dst: "discard",
    };

    try {
      const response = await fetch(`/v1/game/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moveRequest),
      });

      if (!response.ok) throw new Error("Invalid move");
      const newState = await response.json();
      setState(newState);
      setSelectedCard(null);
      setSelectedCards([]);
    } catch (err) {
      console.log("Draw failed:", err.message);
    }
  };

  const handleCardClick = async (card, src) => {
    if (src === "draw") {
      await handleDrawClick();
      return;
    }

    if ((src.startsWith("stack") || src.startsWith("pile")) && selectedCard) {
      const moveRequest = {
        cards: selectedCards,
        src: selectedCard.src,
        dst: src,
      };

      try {
        const response = await fetch(`/v1/game/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moveRequest),
        });

        if (!response.ok) throw new Error("Invalid move");
        const newState = await response.json();
        setState(newState);
      } catch (err) {
        console.log("Move failed:", err.message);
      }
      setSelectedCard(null);
      setSelectedCards([]);
      return;
    }

    if (!card || typeof card !== "object" || (!card.up && src !== "draw")) {
      setSelectedCard(null);
      setSelectedCards([]);
      return;
    }

    if (selectedCard) {
      if (
        selectedCard.src === src &&
        selectedCard.card.suit === card.suit &&
        selectedCard.card.value === card.value
      ) {
        setSelectedCard(null);
        setSelectedCards([]);
        return;
      }

      const moveRequest = {
        cards: selectedCards,
        src: selectedCard.src,
        dst: src,
      };

      try {
        const response = await fetch(`/v1/game/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moveRequest),
        });

        if (!response.ok) throw new Error("Invalid move");
        const newState = await response.json();
        setState(newState);
      } catch (err) {
        console.log("Move failed:", err.message);
      }
      setSelectedCard(null);
      setSelectedCards([]);
    } else {
      if (src.startsWith("stack")) {
        return;
      }

      const pile = state[src];
      const cardIndex = pile.findIndex(
        (c) => c.suit === card.suit && c.value === card.value && c.up
      );

      if (cardIndex === -1) return;

      let cardsToSelect;
      if (src.startsWith("pile")) {
        cardsToSelect = pile.slice(cardIndex);
      } else {
        cardsToSelect = [card];
      }

      setSelectedCard({ card, src });
      setSelectedCards(cardsToSelect);
    }
  };

  const handleBackgroundClick = (event) => {
    if (event.target === event.currentTarget) {
      setSelectedCard(null);
      setSelectedCards([]);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        setSelectedCard(null);
        setSelectedCards([]);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <GameBase onClick={handleBackgroundClick}>
      <ButtonContainer>
        <AutoCompleteButton onClick={handleAutoComplete}>
          Auto-Complete
        </AutoCompleteButton>
      </ButtonContainer>
      <CardRow>
        {["stack1", "stack2", "stack3", "stack4"].map((stack, index) => (
          <Pile
            key={index}
            cards={state[stack]}
            onClick={(card) => handleCardClick(card, stack)}
            selectedCards={selectedCards}
            pileName={stack}
            spacing={0}
          />
        ))}
        <CardRowGap />
        <Pile
          cards={state.draw}
          onClick={(card) => handleCardClick(card, "draw")}
          selectedCards={selectedCards}
          pileName="draw"
          isDraw={true}
        />
        <Pile
          cards={state.discard}
          onClick={(card) => handleCardClick(card, "discard")}
          selectedCards={selectedCards}
          pileName="discard"
          isDiscard={true}
        />
      </CardRow>
      <CardRow>
        {["pile1", "pile2", "pile3", "pile4", "pile5", "pile6", "pile7"].map(
          (pile, index) => (
            <Pile
              key={index}
              cards={state[pile]}
              onClick={(card) => handleCardClick(card, pile)}
              selectedCards={selectedCards}
              pileName={pile}
            />
          )
        )}
      </CardRow>
    </GameBase>
  );
};

Game.propTypes = {};
