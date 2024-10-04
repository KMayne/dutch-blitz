enum Colour {
  Red = "Red",
  Blue = "Blue",
  Green = "Green",
  Yellow = "Yellow",
}

enum Gender {
  Boy,
  Girl,
}

function cardGender(c: Colour): Gender {
  switch (c) {
    case Colour.Red:
      return Gender.Boy;
    case Colour.Blue:
      return Gender.Boy;
    case Colour.Green:
      return Gender.Girl;
    case Colour.Yellow:
      return Gender.Girl;
  }
}

enum Value {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
}

class Card {
  playerName: string;
  colour: Colour;
  value: Value;

  constructor(playerName: string, colour: Colour, value: Value) {
    this.playerName = playerName;
    this.colour = colour;
    this.value = value;
  }

  canPlayOnto(otherCard: Card) {
    return otherCard.colour === this.colour && otherCard.value + 1 === this.value;
  }

  toString(): string {
    return `Card[${this.colour}, ${this.value}]<${this.playerName}>`;
  }
}

function playerDeck(playerName: string): Array<Card> {
  const cardValues = [
    Value.One,
    Value.Two,
    Value.Three,
    Value.Four,
    Value.Five,
    Value.Six,
    Value.Seven,
    Value.Eight,
    Value.Nine,
    Value.Ten,
  ];
  const cardColours = [Colour.Red, Colour.Blue, Colour.Green, Colour.Yellow];
  return cardColours.flatMap((colour) =>
    cardValues.map((value) => new Card(playerName, colour, value))
  );
}

class Player {
  #name: string;
  #deck: Array<Card>;
  // This is the flipped cards from the deck
  #flippedDeck: Array<Card>;
  #blitzPile: Array<Card>;
  // These are the 3 cards in front of each player
  #candidateCards: Array<Card>;

  constructor(name: string) {
    this.#name = name;
    this.#deck = playerDeck(this.#name);
    this.#flippedDeck = [];
    // Shuffle deck
    this.#shuffleDeck();
    // Deal out face up cards, including the top of the Blitz pile
    this.#candidateCards = this.#deck.splice(0, 3);
    // Deal out the blitz pile
    this.#blitzPile = this.#deck.splice(0, 10);
  }

  #shuffleDeck(): void {
    const swap = (idx1: number, idx2: number) => {
      const tmp = this.#deck[idx1];
      this.#deck[idx1] = this.#deck[idx2];
      this.#deck[idx2] = tmp;
    };

    for (let i = 0; i < this.#deck.length; i++) {
      swap(i, Math.floor(Math.random() * this.#deck.length));
    }
  }

  flipDeckCards() {
    if (this.#deck.length > 0) {
      const flippedCards = this.#deck.splice(0, 3).reverse();
      this.#flippedDeck.unshift(...flippedCards);
    } else {
      this.#deck = this.#flippedDeck.reverse();
      this.#flippedDeck = [];
      this.flipDeckCards();
    }
  }

  visibleCards() {
    return [this.#flippedDeck[0], this.#blitzPile[0], ...this.#candidateCards].filter(
      (e) => e !== undefined
    );
  }

  playCard(card: Card): Boolean {
    if (this.#flippedDeck[0] === card) {
      this.#flippedDeck.shift();
    }
    if (this.#blitzPile[0] === card) {
      this.#blitzPile.shift();
      return this.#blitzPile.length === 0;
    }
    const candidateIndex = this.#candidateCards.findIndex((cc) => cc == card);
    if (candidateIndex === -1)
      throw new Error(
        `Cannot play the card ${card} as it is not in any of the flipped piles: ${this.visibleCards()}`
      );
    const topBlitzCard = this.#blitzPile.shift();
    if (topBlitzCard === undefined) throw new Error("Invalid state - unexpected empty Blitz pile");
    this.#candidateCards[candidateIndex] = topBlitzCard;
    return this.#blitzPile.length === 0;
  }
}

class Game {
  #piles: Array<Array<Card>>;
  #players: Array<Player>;

  constructor(playerCount: number) {
    this.#piles = [];
    this.#players = [];
    const defaultPlayerNames = ["Plow", "Bucket", "Cart", "Pump"];
    for (let i = 0; i < playerCount; i++) {
      this.#players.push(new Player(defaultPlayerNames[i]));
    }
  }

  simulateGame() {
    while (!this.#simulateTimeStep()) {}
    console.log("Game finished!", this.#players, this.#piles);
  }

  #simulateTimeStep() {
    for (let p of this.#players) {
      const playableCards = p
        .visibleCards()
        .filter((c) => c.value === 1 || this.#piles.some((pile) => c.canPlayOnto(pile[0])));
      if (playableCards.length === 0) p.flipDeckCards();
      else {
        const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
        console.log("Visible", p.visibleCards());
        console.log("Playable", playableCards);
        console.log("Playing", cardToPlay);
        if (cardToPlay.value === 1) this.#piles.push([cardToPlay]);
        else this.#piles.find((p) => cardToPlay.canPlayOnto(p[0]))?.unshift(cardToPlay);
        const gotBlitz = p.playCard(cardToPlay);
        // End simulation immediately
        if (gotBlitz) {
          return true;
        }
        console.log("Piles", this.#piles);
      }
    }
    // No one Blitz'd
    return false;
  }
}

const game = new Game(4);
game.simulateGame();
