import {finalConsonants, first, initialConsonants, vowels} from "./hangeul";

export function arrayContains(needle, haystack) {
    return (haystack.indexOf(needle) > -1) ? true : false;
}

export function addDecimalToHex(hex, decimalToAdd) {
  return (parseInt(hex, 16) + parseInt(decimalToAdd.toString())).toString(16);
}

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


  // initialConsonants 19, vowels 21, finalConsonants 28
  // 0  = 0th IC, 0th V, 0th FC
  // 1  = 0th IC, 0th V, 1st FC
  // 2  = 0th IC, 0th V, 2nd FC
  // 27 = 0th IC, 0th V, 27th FC

  // 28 = 0th IC, 1st V, 0th FC
  // 29 = 0th IC, 1st V, 1st FC
  // 30 = 0th IC, 1st V, 2nd FC
  // 55 = 0th IC, 1st V, 27th FC

  // 56 = 0th IC, 2nd V, 0th FC
  // 57 = 0th IC, 2nd V, 1st FC
  // 58 = 0th IC, 2nd V, 2nd FC
  // 83 = 0th IC, 2nd V, 27th FC

  // 587 = 0th IC, 20th V, 27th FC

  // 588 = 1st IC, 0th V, 0th FC

  return 'han';
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
