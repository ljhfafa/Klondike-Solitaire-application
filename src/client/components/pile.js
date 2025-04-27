"use strict";

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const CardImg = styled.img`
  position: absolute;
  height: auto;
  width: 100%;
  border: ${(props) =>
    props.highlight === "true" ? "2px solid blue" : "none"};
  transition: transform 0.2s;
  &:hover {
    transform: ${(props) => (props.draggable ? "scale(1.02)" : "none")};
  }
`;

const PileBase = styled.div`
  margin: 5px;
  position: relative;
  display: inline-block;
  border: dashed 2px ${(props) => (props.isValidTarget ? "#4CAF50" : "#808080")};
  border-radius: 5px;
  width: 12%;
  transition: border-color 0.3s;

  &:hover {
    border-color: ${(props) => (props.isValidTarget ? "#2E7D32" : "#808080")};
  }
`;

const PileFrame = styled.div`
  margin-top: 140%;
`;

const EmptyPileHighlight = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) =>
    props.isValidTarget ? "rgba(76, 175, 80, 0.1)" : "transparent"};
  border-radius: 5px;
`;

const Card = ({
  card,
  top,
  left,
  onClick,
  onDragStart,
  highlight,
  selected,
}) => {
  const source = card.up
    ? `/images/${card.value}_of_${card.suit}.png`
    : "/images/face_down.jpg";

  const style = {
    left: `${left}%`,
    top: `${top}%`,
    zIndex: selected ? 100 : "auto",
  };

  const id = `${card.suit}:${card.value}`;

  return (
    <CardImg
      id={id}
      onClick={(e) => {
        e.stopPropagation();
        onClick({ ...card });
      }}
      draggable={card.up}
      onDragStart={(e) => onDragStart && onDragStart(e, card)}
      onDragOver={(e) => e.preventDefault()}
      style={style}
      highlight={highlight || selected ? "true" : undefined}
      src={source}
    />
  );
};

export const Pile = ({
  cards = [],
  spacing = 8,
  horizontal = false,
  onClick,
  selectedCards = [],
  isValidTarget = false,
  pileName = "",
  isDraw = false,
  isDiscard = false,
}) => {
  const isCardSelected = (card) => {
    return selectedCards.some(
      (selectedCard) =>
        selectedCard.suit === card.suit && selectedCard.value === card.value
    );
  };

  const handlePileClick = (e) => {
    if (cards.length === 0) {
      onClick(null);
    }
  };

  let displayCards = cards;

  // For draw pile, only show the last card
  if (isDraw) {
    displayCards = cards.length > 0 ? [cards[cards.length - 1]] : [];
  }
  // For discard pile, only show the last (top) card
  else if (isDiscard) {
    displayCards = cards.length > 0 ? [cards[cards.length - 1]] : [];
  }

  const children = displayCards.map((card, i) => {
    const top = horizontal ? 0 : i * spacing;
    const left = horizontal ? i * spacing : 0;
    const selected = isCardSelected(card);

    return (
      <Card
        key={`${card.suit}-${card.value}-${i}`}
        card={card}
        top={top}
        left={left}
        onClick={(card) => {
          onClick(card);
        }}
        selected={selected}
        highlight={isValidTarget && i === cards.length - 1}
      />
    );
  });

  return (
    <PileBase
      onClick={handlePileClick}
      isValidTarget={isValidTarget}
      data-pile-name={pileName}
    >
      <PileFrame />
      {children}
      {cards.length === 0 && (
        <EmptyPileHighlight isValidTarget={isValidTarget} />
      )}
    </PileBase>
  );
};

Pile.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func,
  horizontal: PropTypes.bool,
  spacing: PropTypes.number,
  selectedCards: PropTypes.array,
  isValidTarget: PropTypes.bool,
  pileName: PropTypes.string,
  isDraw: PropTypes.bool,
  isDiscard: PropTypes.bool,
};

Pile.defaultProps = {
  cards: [],
  spacing: 8,
  horizontal: false,
  selectedCards: [],
  isValidTarget: false,
  pileName: "",
  isDraw: false,
  isDiscard: false,
};
