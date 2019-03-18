import * as hangeul from "./hangeul";
import {availableLetterSets, availableSyllableSets} from "./hangeul";

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
 * Returns an array of allowed syllables, identified (as usual) by their hexadecimal Unicode values,
 * narrowed down from the full array by taking into account the specified allowed letter/syllable sets.
 *
 * @param allowedSyllableSets Identified by their hexadecimal Unicode values, as usual.
 */
export function getAllowedSyllables(allowedLetterSets, allowedSyllableSets) {
  // Start with all syllables
  let allowedSyllables = [...Array(parseInt(hangeul.last, 16) - parseInt(hangeul.first, 16) + 1).keys()]
      .map(e => e + parseInt(hangeul.first, 16));

  // Narrow down to the allowed syllable sets
  allowedSyllables = intersection(
    allowedSyllableSets
      .map(set => set.map(h => parseInt(h, 16)))
      .concat([allowedSyllables])
  );

  // Narrow down to the allowed letter sets
  let allowedLetters = allowedLetterSets
      .map(r => r.allowedLetters.concat(r.similarAllowedLetters ? r.similarAllowedLetters : []))
      .reduce((a, b) => a.concat(b).filter((v, i, a) => a.indexOf(v) === i), []); // .union()

  // Filter out final consonants to respect the ALLOW_FINAL_CONSONANTS rule
  let finalConsonantsOn = true; // TODO

  // TODO: Do this using math instead of iteration
  allowedSyllables = allowedSyllables
      .filter(s => {
        let letters = getIndividualLettersFromHex(s.toString(16));

        // Check if the letters are allowed (or, for the case of the final consonant in particular, empty, meaning no letter)
        if (allowedLetters.length > 0 && !letters.every(l => allowedLetters.includes(l) || l === ''))
          return false;

        // Check if final consonants are allowed
        if (!finalConsonantsOn && letters[2] !== '')
          return false;

        return true;
      });

  return allowedSyllables.map(s => s.toString(16));
}

export function lookupLetterSetsByName(letterSetNames) {
  let letterSets = [];
  Object.keys(availableLetterSets).forEach(letterSetName => {
    if (letterSetNames.includes(letterSetName))
      letterSets.push(availableLetterSets[letterSetName]);
  });
  return letterSets;
}

export function lookupSyllableSetsByName(syllableSetNames) {
  let syllableSets = [];
  Object.keys(availableSyllableSets).forEach(syllableSetName => {
    if (syllableSetNames.includes(syllableSetName))
      syllableSets.push(availableSyllableSets[syllableSetName]);
  });
  return syllableSets;
}

/**
 * Selects and returns an array of  number of random syllables, identified (as usual) by their
 * hexadecimal Unicode value.
 *
 * @param amount
 *    Number of random syllables to return in total, after taking into account `includeSyllableHexes` and `excludeSyllableHexes`.
 *
 * @param allowedSyllableHexes
 *    A required array that includes syllables that we can choose from (based on the selected syllable/letter sets),
 *    identified (as usual) by their hexadecimal Unicode values.
 *
 * @param includeSyllableHexes
 *    An optional array that includes syllables that should be included in the returned array,
 *    identified (as usual) by their hexadecimal Unicode values.
 *
 * @param excludeSyllableHexes
 *    An optional array that includes syllables that should be excluded from the returned array,
 *    identified (as usual) by their hexadecimal Unicode values.
 */
export function getRandomSyllables(amount, allowedSyllableHexes, includeSyllableHexes, excludeSyllableHexes) {
  let randomSyllableHexes = [];
  let romanizations = []; // Temp array, used for checking romanization clashes

  // If an `include` array is specified, then start with them, and
  // filter the allowed syllables to just similar ones, to make this hard
  if (includeSyllableHexes) {
    includeSyllableHexes.forEach(s => {
      randomSyllableHexes.push(s);
      romanizations.push(getRomanization(s));
    });

    let targetLetters = getIndividualLettersFromHex(includeSyllableHexes[0]); // Note this just picks the first
    allowedSyllableHexes = allowedSyllableHexes
      .filter(s => {
        let letters = getIndividualLettersFromHex(s);
        if ((targetLetters[2] === '') !== (letters[2] === ''))
            return false;
        if (intersection([letters, targetLetters]).length === 2)
          return true;
        return false;
      });
  }

  while (randomSyllableHexes.length < amount) {
    let randomSyllableHex = allowedSyllableHexes[getRandomInt(0, allowedSyllableHexes.length - 1)].toString(16);

    // Don't include the specified syllables in `excludeSyllableHexes`
    if (excludeSyllableHexes && excludeSyllableHexes.includes(randomSyllableHex))
      continue;

    // Don't include any already-chosen syllables
    if (randomSyllableHexes.includes(randomSyllableHex))
      continue;

    // Don't include any syllables that clash in romanization with already-chosen syllables
    let romanization = getRomanization(randomSyllableHex);
    if (romanizations.includes(romanization))
      continue;

    // Good to go!
    randomSyllableHexes.push(randomSyllableHex);
    romanizations.push(romanization);
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

/**
 * Returns an array of elements that are included in all of the specified arrays.
 * @param arrays An array of arrays whose elements to intersect.
 */
function intersection(arrays) {
  if (arrays.length === 0)
    return [];
  if (arrays.length === 1)
    return arrays[0];
  let skipOne = arrays.splice(1);
  return arrays[0].filter(x => skipOne.every(arr => arr.includes(x)));
}
