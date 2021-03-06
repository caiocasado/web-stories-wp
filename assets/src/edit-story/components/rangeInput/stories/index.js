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
import { number } from '@storybook/addon-knobs';

/**
 * Internal dependencies
 */
import RangeInput from '../';

export default {
  title: 'Stories Editor/Components/RangeInput',
  component: RangeInput,
  parameters: {
    backgrounds: [{ name: 'dark background', value: '#000', default: true }],
  },
};

export const _default = () => {
  const thumbSize = number('Thumb size', 16);
  const min = number('Min value', 0);
  const max = number('Max value', 100);
  const step = number('Step', 10);

  return <RangeInput thumbSize={thumbSize} min={min} max={max} step={step} />;
};
