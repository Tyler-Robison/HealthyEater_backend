const { formatIngredients } = require('../Support/helpers')

describe("save recipe", function () {
    test("Correctly formats ingredient string", async function () {

        const ingredients = ['cheese', 'ham']
        const formattedString = formatIngredients(ingredients)

        expect(formattedString).toEqual('cheese,+ham')
    });
});