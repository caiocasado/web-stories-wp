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
 * WordPress dependencies
 */
import { useEffect, useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useStory } from '../../app';
import { Color } from '../form';
import { SimplePanel } from './panel';

const DEFAULT_COLOR = { color: { r: 255, g: 255, b: 255 } };
function PageBackgroundPanel() {
  const {
    state: { currentPage },
    actions: { updateCurrentPageProperties },
  } = useStory();
  const currentBackground = currentPage?.backgroundColor || DEFAULT_COLOR;
  const [color, setColor] = useState(currentBackground);
  useEffect(() => setColor(currentBackground), [currentBackground]);
  const handleChange = useCallback(
    (value) => {
      setColor(value);
      updateCurrentPageProperties({ properties: { backgroundColor: value } });
    },
    [updateCurrentPageProperties]
  );
  return (
    <SimplePanel name="pagebackground" title={__('Page', 'web-stories')}>
      {/* TODO: Replace with custom color picker component once implemented */}
      <Color value={color} onChange={handleChange} />
    </SimplePanel>
  );
}

export default PageBackgroundPanel;
