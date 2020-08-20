import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { DataStore, Predicates } from '@aws-amplify/datastore'
import Amplify from '@aws-amplify/core'
import * as models from './models'
import { withAuthenticator } from "aws-amplify-react";
import awsconfig from './aws-exports'
Amplify.configure(awsconfig)

window.LOG_LEVEL = 'DEBUG'

function App() {
  const [status, setStatus] = useState([null, null])
  window.dataStore = DataStore
  window.models = models
  window.predicates = Predicates
  window.handler = promise => promise
    .then(data => {
      window.data = data
      console.info('Data is', data)
      setStatus([data, null])
    })
    .catch(err => {
      window.err = err
      console.error('Err is', err)
      setStatus([null, err])
    })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={async () => {
          try {
            await DataStore.save(
              new models.Comment({
                id: `my custom ID ${Math.random()}`,
                userID: 'userID',
                instanceID: 'instanceID',
                organisationID: 'organisationID',
                text: 'text'
              })
            )
            console.info('Comment saved successfully!')
          } catch (error) {
            console.error('Error saving comment', error)
          }
        }}>Create comment</button>
        [data, error]
        {status}
      </header>
    </div>
  );
}

export default withAuthenticator(App);
