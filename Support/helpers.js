

/** ingredients come in as ['ham', 'cheese', 'bread']
 *  output as 'ham,+cheese,+bread'
 *  This format is required by Spoontacular API
 */
const formatIngredients = ingredientsArray => ingredientsArray.join(',+')


module.exports = {
    formatIngredients
}