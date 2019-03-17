import * as hangeul from "./hangeul";
import {RuleType} from "./hangeul";

/**
 * Parses the specified hexadecimal code into a syllable and returns an array
 * of the initial consonant, vowel and (if any) final consonant.
 * @param syllableHex
 * @returns {string[]}
 */
export function getIndividualLettersFromHex(syllableHex) {
  let difference = parseInt(syllableHex, 16) - parseInt(hangeul.first, 16);

  let idxInitialConsonant = Math.floor(difference / (hangeul.finalConsonants.length * hangeul.vowels.length));
  let initialConsonant = hangeul.initialConsonants[idxInitialConsonant];
  difference -= idxInitialConsonant * hangeul.finalConsonants.length * hangeul.vowels.length;

  let idxVowel = Math.floor(difference / (hangeul.finalConsonants.length));
  let vowel = hangeul.vowels[idxVowel];
  difference -= idxVowel * hangeul.finalConsonants.length;

  let idxFinalConsonant = difference;
  let finalConsonant = hangeul.finalConsonants[idxFinalConsonant];

  return [initialConsonant, vowel, finalConsonant];
}

/**
 * Returns the romanization of the supplied syllable, identified (as usual) by its hexadecimal
 * Unicode value.
 *
 * @param syllableHex
 *    The syllable to be romanized, identified (as usual) by its hexadecimal Unicode value.
 */
export function getRomanization(syllableHex) {
  let letters = getIndividualLettersFromHex(syllableHex);

  return hangeul.romanizations[letters[0]][0]
    + hangeul.romanizations[letters[1]][0]
    + hangeul.romanizations[letters[2]][0];
}

/**
 * Selects and returns an array of  number of random syllables, identified (as usual) by their
 * hexadecimal Unicode value.
 *
 * @param amount
 *    Number of random syllables to return in total, after taking into account `includeSyllableHexes` and `excludeSyllableHexes`.
 *
 * @param rules
 *
 * @param includeSyllableHexes
 *    An optional array that includes syllables that should be included in the returned array,
 *    identified (as usual) by their hexadecimal Unicode values.
 *
 * @param excludeSyllableHexes
 *    An optional array that includes syllables that should be excluded from the returned array,
 *    identified (as usual) by their hexadecimal Unicode values.
 */
export function getRandomSyllables(amount, rules, includeSyllableHexes, excludeSyllableHexes) {
  let randomSyllableHexes = [];
  let romanizations = []; // Temp array, used for checking romanization clashes
  let desiredRandomSyllableAmount = amount;
  if (includeSyllableHexes)
    desiredRandomSyllableAmount -= includeSyllableHexes.length;

  // Summarize the rules
  let allowedSyllables = intersection(
    rules
      .filter(r => r.type === RuleType.ALLOWED_SYLLABLES)
      .map(r => r.allowedSyllables));

  let allowedLetters = rules
    .filter(r => r.type === RuleType.ALLOWED_CONSONANTS || r.type === RuleType.ALLOWED_VOWELS)
    .map(r => r.allowedLetters)
    .reduce((a, b) => a.concat(b), []);
  let finalConsonantsOn = rules
    .filter(r => r.type === RuleType.ALLOW_FINAL_CONSONANTS)
    .length > 0;

  let attempt = 0;
  while (randomSyllableHexes.length < desiredRandomSyllableAmount) {
    attempt++;
    if (attempt === 5000)
      return ['ac00'];

    let randomSyllableHex;

    // If the rules specify allowedSyllables, pick from those
    if (allowedSyllables.length > 0) {
      randomSyllableHex = allowedSyllables[getRandomInt(0, allowedSyllables.length - 1)];
    } else {
      // Pick a random syllable from `first` to `last`
      randomSyllableHex = getRandomInt(parseInt(hangeul.first, 16), parseInt(hangeul.last, 16)).toString(16);
    }

    // Don't include the specified syllables in `excludeSyllableHexes`
    if (excludeSyllableHexes && excludeSyllableHexes.includes(randomSyllableHex)) {
      console.log('not choosing ' + randomSyllableHex + ', it\'s excluded');
      continue;
    }

    // Don't include any already-chosen syllables
    if (randomSyllableHexes.includes(randomSyllableHex)) {
      console.log('not choosing ' + randomSyllableHex + ', it was already chosen');
      continue;
    }

    // Don't include any syllables that clash in romanization with already-chosen syllables
    let romanization = getRomanization(randomSyllableHex);
    if (romanizations.includes(romanization)) {
      console.log('not choosing ' + randomSyllableHex + ', its romanization was already chosen');
      continue;
    }

    // Don't include any syllables that violate the allowedLetters
    let letters = getIndividualLettersFromHex(randomSyllableHex);
    if (allowedLetters.length > 0 && letters.some(l => !allowedLetters.includes(l))) {
      console.log('not choosing ' + randomSyllableHex + ', it is not allowed');
      continue;
    }

    // Don't include any syllables that have final consonants, if they're not allowed
    if (!finalConsonantsOn && letters[2] !== '') {
      console.log('not choosing ' + randomSyllableHex + ', it has a final consonant');
      continue;
    }

    // Good to go!
    console.log('chose ' + randomSyllableHex);
    randomSyllableHexes.push(randomSyllableHex);
    romanizations.push(romanization);
  }

  // Add the `includeSyllableHexes` syllables
  if (includeSyllableHexes) {
    for (let i = 0; i < includeSyllableHexes.length; i++)
      randomSyllableHexes.push(includeSyllableHexes[i]);
  }

  shuffle(randomSyllableHexes);
  return randomSyllableHexes;
}

/**
 * Performs the Fisher-Yates shuffle in place on the specified array.
 */
export function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle
  while (0 !== currentIndex) {

    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element
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

function intersection(arrays) {
  if (arrays.length === 0)
    return [];
  if (arrays.length === 1)
    return arrays[0];
  let skipOne = arrays.splice(1);
  return arrays[0].filter(arr => arr.every(x => skipOne.includes(x)));
}
