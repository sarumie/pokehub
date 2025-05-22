import { expect, test, describe } from "bun:test";
import pokemon from "pokemontcgsdk";

describe("Basic assertions", () => {
  test("retrieve Charizard pokemon", () => {
    pokemon.configure({ apiKey: "fb989f11-3b6f-441b-9f0f-a284bd591e58" });

    pokemon.card.find("base1-4").then((card) => {
      expect(card.name).toBe("Charizard");
    });
  });
});
