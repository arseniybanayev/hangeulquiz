import * as hangeul from "./hangeul";
import {RuleType} from "./hangeul";
import {availableRules} from "./hangeul";

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
 * Returns an array of allowed syllables, identified (as usual) by their hexadecimal Unicode
 * values, narrowed down from the full array by taking into account the specified rules.
 */
export function getAllowedSyllables(rules) {
  // Start with all syllables
  let allowedSyllables = [...Array(parseInt(hangeul.last, 16) - parseInt(hangeul.first, 16) + 1).keys()]
    .map(e => e + parseInt(hangeul.first, 16));

  // Narrow down to ALLOWED_SYLLABLES rules
  allowedSyllables = intersection(
    rules
      .filter(r => r.type === RuleType.ALLOWED_SYLLABLES)
      .map(r => r.allowedSyllables.map(s => parseInt(s, 16)))
      .concat([allowedSyllables])
  );

  // Narrow down to ALLOWED_VOWELS and ALLOWED_CONSONANTS rules
  let allowedLetters = rules
    .filter(r => r.type === RuleType.ALLOWED_CONSONANTS || r.type === RuleType.ALLOWED_VOWELS)
    .map(r => r.allowedLetters)
    .reduce((a, b) => a.concat(b).filter((v, i, a) => a.indexOf(v) === i)); // .union()

  // Filter out final consonants to respect the ALLOW_FINAL_CONSONANTS rule
  let finalConsonantsOn = rules.filter(r => r.type === RuleType.ALLOW_FINAL_CONSONANTS).length > 0;

  // TODO: Do this using math instead of iteration
  allowedSyllables = allowedSyllables
    .filter(s => {
      let letters = getIndividualLettersFromHex(s.toString(16));
      // Check if the letters are allowed (or, for the case of the final consonant in particular, empty, meaning no letter)
      if (allowedLetters.length > 0 && !letters.every(l => allowedLetters.includes(l) || l === '')) {
        return false;
      }
      if (!finalConsonantsOn && letters[2] !== '') {
        return false;
      }
      return true;
    });

  return allowedSyllables.map(s => s.toString(16));
}

/**
 * Converts a rule name into the full rule. Effectively a deserialization method,
 * whereas the serialization method is just (rule => rule.name).
 */
export function lookupRulesByName(ruleNames) {
  let rules = [];
  Object.keys(availableRules).forEach(ruleGroupName => {
    let ruleGroup = availableRules[ruleGroupName];
    Object.keys(ruleGroup).forEach(ruleName => {
      if (ruleNames.includes(ruleName))
        rules.push(ruleGroup[ruleName]);
    })
  });
  return rules;
}

/**
 * Selects and returns an array of  number of random syllables, identified (as usual) by their
 * hexadecimal Unicode value.
 *
 * @param amount
 *    Number of random syllables to return in total, after taking into account `includeSyllableHexes` and `excludeSyllableHexes`.
 *
 * @param allowedSyllableHexes
 *    A required array that includes syllables that we can choose from (based on the rules),
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
  let desiredRandomSyllableAmount = amount;
  if (includeSyllableHexes)
    desiredRandomSyllableAmount -= includeSyllableHexes.length;

  while (randomSyllableHexes.length < desiredRandomSyllableAmount) {
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
  return arrays[0].filter(arr => arr.every(x => skipOne.includes(x)));
}
