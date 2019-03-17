import * as hangeul from "./hangeul";

/**
 * Returns the romanization of the supplied syllable, identified (as usual) by its hexadecimal
 * Unicode value.
 *
 * @param syllable
 *    The syllable to be romanized, identified (as usual) by its hexadecimal Unicode value.
 */
export function getRomanization(syllable) {
  console.log('Syllable: ' + syllable);
  let difference = parseInt(syllable, 16) - parseInt(hangeul.first, 16);
  console.log('Difference: ' + difference);

  let idxInitialConsonant = Math.floor(difference / (hangeul.finalConsonants.length * hangeul.vowels.length));
  console.log('Index of initial consonant: ' + idxInitialConsonant);
  let initialConsonant = hangeul.initialConsonants[idxInitialConsonant];
  difference -= idxInitialConsonant * hangeul.finalConsonants.length * hangeul.vowels.length;
  console.log('Initial consonant: ' + initialConsonant);

  let idxVowel = Math.floor(difference / (hangeul.finalConsonants.length));
  console.log('Index of vowel: ' + idxVowel);
  let vowel = hangeul.vowels[idxVowel];
  difference -= idxVowel * hangeul.finalConsonants.length;
  console.log('Vowel: ' + vowel);

  let idxFinalConsonant = difference;
  console.log('Index of final consonant: ' + idxFinalConsonant);
  let finalConsonant = hangeul.finalConsonants[idxFinalConsonant];
  console.log('Final consonant: ' + finalConsonant);

  return hangeul.romanizations[initialConsonant][0] + hangeul.romanizations[vowel][0] + hangeul.romanizations[finalConsonant][0];
}

/**
 * Selects and returns an array of  number of random syllables, identified (as usual) by their
 * hexadecimal Unicode value.
 *
 * @param amount
 *    Number of random syllables to return in total, after taking into account `include` and `exclude`.
 *
 * @param include
 *    An optional array that includes syllables that should be included in the returned array,
 *    identified (as usual) by their hexadecimal Unicode values.
 *
 * @param exclude
 *    An optional array that includes syllables that should be excluded from the returned array,
 *    identified (as usual) by their hexadecimal Unicode values.
 */
export function getRandomSyllables(amount, include, exclude) {
  console.log('amount: ' + amount);
  console.log('include: ' + include);
  console.log('exclude: ' + exclude);
  let randomSyllables = [];
  let romanizations = []; // Temp array, used for checking romanization clashes
  let desiredRandomSyllableAmount = amount;
  if (include)
    desiredRandomSyllableAmount -= include.length;

  while (randomSyllables.length < desiredRandomSyllableAmount) {
    // Pick a random syllable from `first` to `last`
    let randomSyllable = getRandomInt(parseInt(hangeul.first, 16), parseInt(hangeul.last, 16)).toString(16);

    // TODO: Don't include any syllables outside the chosen groups

    // Don't include the specified syllables in `exclude`
    if (exclude && exclude.includes(randomSyllable))
      continue;

    // Don't include any already-chosen syllables
    if (randomSyllables.includes(randomSyllable))
      continue;

    // Don't include any syllables that clash in romanization with already chosen syllables
    let romanization = getRomanization(randomSyllable);
    if (romanizations.includes(romanization))
      continue;

    // Good to go!
    randomSyllables.push(randomSyllable);
    romanizations.push(romanization);
  }

  // Add the `include` syllables
  if (include) {
    for (var i = 0; i < include.length; i++)
      randomSyllables.push(include[i]);
  }

  shuffle(randomSyllables);
  console.log(randomSyllables);
  return randomSyllables;
}

/**
 * Performs the Fisher-Yates shuffle in place on the specified array.
 */
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).let
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
