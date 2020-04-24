/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import { Modifier, EditorState } from 'draft-js';

/**
 * Internal dependencies
 */
import { MULTIPLE_VALUE } from '../form';
import createSolid from '../../utils/createSolid';
import {
  weightToStyle,
  styleToWeight,
  letterSpacingToStyle,
  styleToLetterSpacing,
  colorToStyle,
  styleToColor,
  NONE,
  WEIGHT,
  ITALIC,
  UNDERLINE,
  LETTERSPACING,
  COLOR,
  NORMAL_WEIGHT,
  SMALLEST_BOLD,
  DEFAULT_BOLD,
} from './customConstants';

function getPrefixStyleForCharacter(styles, prefix) {
  const list = styles.toArray().map((style) => style.style ?? style);
  if (!list.some((style) => style && style.startsWith(prefix))) {
    return NONE;
  }
  return list.find((style) => style.startsWith(prefix));
}

function getPrefixStylesInSelection(editorState, prefix) {
  const selection = editorState.getSelection();
  const styles = new Set();
  if (selection.isCollapsed()) {
    styles.add(
      getPrefixStyleForCharacter(editorState.getCurrentInlineStyle(), prefix)
    );
    return [...styles];
  }

  const contentState = editorState.getCurrentContent();
  let key = selection.getStartKey();
  let startOffset = selection.getStartOffset();
  const endKey = selection.getEndKey();
  const endOffset = selection.getEndOffset();
  let hasMoreRounds = true;
  while (hasMoreRounds) {
    hasMoreRounds = key !== endKey;
    const block = contentState.getBlockForKey(key);
    const offsetEnd = hasMoreRounds ? block.getLength() : endOffset;
    const characterList = block.getCharacterList();
    for (
      let offsetIndex = startOffset;
      offsetIndex < offsetEnd;
      offsetIndex++
    ) {
      styles.add(
        getPrefixStyleForCharacter(
          characterList.get(offsetIndex).getStyle(),
          prefix
        )
      );
    }
    if (!hasMoreRounds) {
      break;
    }
    key = contentState.getKeyAfter(key);
    startOffset = 0;
  }

  return [...styles];
}

function applyContent(editorState, contentState) {
  return EditorState.push(editorState, contentState, 'change-inline-style');
}

function togglePrefixStyle(
  editorState,
  prefix,
  shouldSetStyle = null,
  getStyleToSet = null
) {
  if (editorState.getSelection().isCollapsed()) {
    // A different set of rules apply here
    // First find all styles that apply at cursor - we'll reapply those as override
    // with modifications at the end
    let inlineStyles = editorState.getCurrentInlineStyle();

    // See if there's a matching style for our prefix
    const foundMatch = getPrefixStyleForCharacter(inlineStyles, prefix);

    // Then remove potentially found style from list
    if (foundMatch !== NONE) {
      inlineStyles = inlineStyles.remove(foundMatch);
    }

    // Then figure out whether to apply new style or not
    const willAddStyle = shouldSetStyle
      ? shouldSetStyle([foundMatch])
      : foundMatch === NONE;

    // If so, add to list
    if (willAddStyle) {
      const styleToAdd = getStyleToSet ? getStyleToSet([foundMatch]) : prefix;
      inlineStyles = inlineStyles.add(styleToAdd);
    }

    // Finally apply to style override
    const newState = EditorState.setInlineStyleOverride(
      editorState,
      inlineStyles
    );
    return newState;
  }

  const matchingStyles = getPrefixStylesInSelection(editorState, prefix);

  // First remove all old styles natching prefix
  // (except NONE, it's not actually a style)
  const stylesToRemove = matchingStyles.filter((s) => s !== NONE);
  const strippedContentState = stylesToRemove.reduce(
    (contentState, styleToRemove) =>
      Modifier.removeInlineStyle(
        contentState,
        editorState.getSelection(),
        styleToRemove
      ),
    editorState.getCurrentContent()
  );

  // Should we add a style to everything now?
  // If no function is given, we simply add the style if any
  // character did not have a match (NONE is in the list)
  const willSetStyle = shouldSetStyle
    ? shouldSetStyle(matchingStyles)
    : matchingStyles.includes(NONE);

  if (!willSetStyle) {
    // we're done!
    return applyContent(editorState, strippedContentState);
  }

  // Add style to entire selection
  // If no function is given, we simple add the prefix as a style
  const styleToSet = getStyleToSet ? getStyleToSet(matchingStyles) : prefix;
  const newContentState = Modifier.applyInlineStyle(
    strippedContentState,
    editorState.getSelection(),
    styleToSet
  );

  return applyContent(editorState, newContentState);
}

// convert a set of weight styles to a set of weights
function getWeights(styles) {
  return styles.map((style) =>
    style === NONE ? NORMAL_WEIGHT : styleToWeight(style)
  );
}

export function isBold(editorState) {
  const styles = getPrefixStylesInSelection(editorState, WEIGHT);
  const weights = getWeights(styles);
  const allIsBold = weights.every((w) => w >= SMALLEST_BOLD);
  return allIsBold;
}

export function toggleBold(editorState, flag) {
  // if flag set, use flag
  // otherwise if any character has weight less than SMALLEST_BOLD,
  // everything should be bolded
  const shouldSetBold = (styles) =>
    typeof flag === 'boolean'
      ? flag
      : getWeights(styles).some((w) => w < SMALLEST_BOLD);

  // if flag set, toggle to either 400 or 700,
  // otherwise if setting a bold, it should be the boldest current weight,
  // though at least DEFAULT_BOLD
  const getBoldToSet = (styles) =>
    typeof flag === 'boolean'
      ? weightToStyle(flag ? DEFAULT_BOLD : NORMAL_WEIGHT)
      : weightToStyle(
          Math.max.apply(null, [DEFAULT_BOLD].concat(getWeights(styles)))
        );

  return togglePrefixStyle(editorState, WEIGHT, shouldSetBold, getBoldToSet);
}

export function getFontWeight(editorState) {
  const styles = getPrefixStylesInSelection(editorState, WEIGHT);
  const weights = getWeights(styles);
  if (weights.length > 1) {
    return MULTIPLE_VALUE;
  }
  return weights[0];
}

export function setFontWeight(editorState, weight) {
  // if the weight to set is non-400, set a style
  // (if 400 is target, all other weights are just removed, and we're good)
  const shouldSetStyle = () => weight !== 400;

  // and if we're setting a style, it's the style for the weight of course
  const getBoldToSet = () => weightToStyle(weight);

  return togglePrefixStyle(editorState, WEIGHT, shouldSetStyle, getBoldToSet);
}

export function isItalic(editorState) {
  const styles = getPrefixStylesInSelection(editorState, ITALIC);
  return !styles.includes(NONE);
}

export function toggleItalic(editorState, flag) {
  return togglePrefixStyle(
    editorState,
    ITALIC,
    typeof flag === 'boolean' && (() => flag)
  );
}

export function isUnderline(editorState) {
  const styles = getPrefixStylesInSelection(editorState, UNDERLINE);
  return !styles.includes(NONE);
}

export function toggleUnderline(editorState, flag) {
  return togglePrefixStyle(
    editorState,
    UNDERLINE,
    typeof flag === 'boolean' && (() => flag)
  );
}

export function getLetterSpacing(editorState) {
  const styles = getPrefixStylesInSelection(editorState, LETTERSPACING);
  if (styles.length > 1) {
    return MULTIPLE_VALUE;
  }
  const spacingStyle = styles[0];
  if (spacingStyle === NONE) {
    return 0;
  }
  return styleToLetterSpacing(spacingStyle);
}

export function setLetterSpacing(editorState, letterSpacing) {
  // if the spacing to set to non-0, set a style
  const shouldSetStyle = () => letterSpacing !== 0;

  // and if we're setting a style, it's the style for the spacing of course
  const getStyleToSet = () => letterSpacingToStyle(letterSpacing);

  return togglePrefixStyle(
    editorState,
    LETTERSPACING,
    shouldSetStyle,
    getStyleToSet
  );
}

export function getColor(editorState) {
  const styles = getPrefixStylesInSelection(editorState, COLOR);
  if (styles.length > 1) {
    return MULTIPLE_VALUE;
  }
  const colorStyle = styles[0];
  if (colorStyle === NONE) {
    return createSolid(0, 0, 0);
  }
  return styleToColor(colorStyle);
}

export function setColor(editorState, color) {
  // we set all colors - one could argue that opaque black
  // was default, and wasn't necessary, but it's probably not worth the trouble
  const shouldSetStyle = () => true;

  // the style util manages conversion
  const getStyleToSet = () => colorToStyle(color);

  return togglePrefixStyle(editorState, COLOR, shouldSetStyle, getStyleToSet);
}

export function getStateInfo(state) {
  return {
    fontWeight: getFontWeight(state),
    isBold: isBold(state),
    isItalic: isItalic(state),
    isUnderline: isUnderline(state),
    letterSpacing: getLetterSpacing(state),
    color: getColor(state),
  };
}