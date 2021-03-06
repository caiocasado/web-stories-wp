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
 * Internal dependencies
 */
import { TEXT_ELEMENT_DEFAULT_FONT } from '../../app/font/defaultFonts';
import { BACKGROUND_TEXT_MODE } from '../../constants';
import { PanelTypes } from '../../components/panels';
import { SHARED_DEFAULT_ATTRIBUTES } from '../shared';
import createSolid from '../../utils/createSolid';
export { default as Display } from './display';
export { default as Edit } from './edit';
export { default as Frame } from './frame';
export { default as Output } from './output';
export { default as TextContent } from './textContent';
export { default as LayerContent } from './layer';
export { default as LayerIcon } from './icon';
export { default as updateForResizeEvent } from './updateForResizeEvent';

export const defaultAttributes = {
  ...SHARED_DEFAULT_ATTRIBUTES,
  backgroundTextMode: BACKGROUND_TEXT_MODE.NONE,
  bold: false,
  font: TEXT_ELEMENT_DEFAULT_FONT,
  fontWeight: 400,
  fontSize: 36,
  fontStyle: 'normal',
  backgroundColor: createSolid(196, 196, 196),
  color: createSolid(0, 0, 0),
  letterSpacing: 0,
  lineHeight: 1.3,
  textAlign: 'initial',
  textDecoration: 'none',
  padding: {
    vertical: 0,
    horizontal: 0,
    locked: true,
  },
};

export const hasEditMode = true;

export const isMedia = false;

export const canFlip = false;

export const isMaskable = false;

export const resizeRules = {
  vertical: false,
  horizontal: true,
  diagonal: true,
};

export const panels = [
  PanelTypes.STYLE_PRESETS,
  PanelTypes.ELEMENT_ALIGNMENT,
  PanelTypes.SIZE_POSITION,
  PanelTypes.LAYER_STYLE,
  PanelTypes.TEXT_STYLE,
  PanelTypes.LINK,
];
