/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Providers from './app/providers';
import Router from './app/router';

export default function App() {
  return (
    <Providers>
      <Router />
    </Providers>
  );
}
