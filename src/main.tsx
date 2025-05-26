import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import GroupDateFinder from './GroupDateFinder';

import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

datadogRum.init({
    applicationId: '18835e6c-6428-4bda-b241-f8fff5b0e04e',
    clientToken: 'puba80a592f5f7503dbcf3565b8fabe8df2',
    site: 'datadoghq.com',
    service:'see-ya-there',
    env: 'Prod',
    
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',
    sessionSampleRate:  100,
    sessionReplaySampleRate: 100,
    defaultPrivacyLevel: 'mask-user-input',
    plugins: [reactPlugin({ router: true })],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GroupDateFinder />
  </React.StrictMode>,
);
