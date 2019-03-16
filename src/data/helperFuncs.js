import {finalConsonants, first, initialConsonants, romanizations, vowels} from "./hangeul";

/**
 * Returns the romanization of the supplied syllable, identified (as usual) by its hexadecimal
 * Unicode value.
 *
 * @param syllable
 *    The syllable to be romanized, identified (as usual) by its hexadecimal Unicode value.
 */
export function getRomanization(syllable) {
  console.log('Syllable: ' + syllable);
  let difference = parseInt(syllable, 16) - parseInt(first, 16);
  console.log('Difference: ' + difference);

  let idxInitialConsonant = Math.floor(difference / (finalConsonants.length * vowels.length));
  console.log('Index of initial consonant: ' + idxInitialConsonant);
  let initialConsonant = initialConsonants[idxInitialConsonant];
  difference -= idxInitialConsonant * finalConsonants.length * vowels.length;
  console.log('Initial consonant: ' + initialConsonant);

  let idxVowel = Math.floor(difference / (finalConsonants.length));
  console.log('Index of vowel: ' + idxVowel);
  let vowel = vowels[idxVowel];
  difference -= idxVowel * finalConsonants.length;
  console.log('Vowel: ' + vowel);

  let idxFinalConsonant = difference;
  console.log('Index of final consonant: ' + idxFinalConsonant);
  let finalConsonant = finalConsonants[idxFinalConsonant];
  console.log('Final consonant: ' + finalConsonant);

  return romanizations[initialConsonant][0] + romanizations[vowel][0] + romanizations[finalConsonant][0];
}

/**
 * Performs the Fisher-Yates shuffle in place on the specified array.
 */
export function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

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
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function findRomajisAtKanaKey(needle, kanaDictionary) {
    let romaji = [];
    Object.keys(kanaDictionary).map(function(whichKana) {
    // console.log(whichKana); // 'hiragana' or 'katakana'
        Object.keys(kanaDictionary[whichKana]).map(function(groupName) {
            // console.log(groupName); // 'h_group1', ...
            Object.keys(kanaDictionary[whichKana][groupName]['characters']).map(function(key) {
                if(key==needle) {
                    // console.log(kanas[whichKana][groupName]['characters'][key]);
                    romaji = kanaDictionary[whichKana][groupName]['characters'][key];
                }
            }, this);
        }, this);
    }, this);
    // console.log(romaji);
    return romaji;
}

export function removeHash () { 
    var loc = window.location;
    if ("pushState" in history)
        history.replaceState("", document.title, loc.pathname + loc.search);

}

export function cartesianProduct(elements) {
    if (!Array.isArray(elements)) {
        throw new TypeError();
    }

    var end = elements.length - 1,
    result = [];

    function addTo(curr, start) {
        var first = elements[start],
            last = (start === end);

        for (var i = 0; i < first.length; ++i) {
            var copy = curr.slice();
            copy.push(first[i]);

            if (last) {
                result.push(copy);
            } else {
                addTo(copy, start + 1);
            }
        }
    }

    if (elements.length) {
        addTo([], 0);
    } else {
        result.push([]);
    }
    return result;
}
