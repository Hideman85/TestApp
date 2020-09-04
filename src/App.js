import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import '@aws-amplify/ui/dist/style.css';
import { DataStore } from '@aws-amplify/datastore'
import Amplify from '@aws-amplify/core'
import * as models from './models'
import { schema } from './models/schema'
import { withAuthenticator } from "aws-amplify-react";
import awsconfig from './aws-exports'
Amplify.configure(awsconfig)

window.LOG_LEVEL = 'DEBUG'

const genModel = modelKey => {
  const data = {}

  Object.keys(schema.models[modelKey].fields).forEach(key => {
    if (typeof schema.models[modelKey].fields[key].type === 'string') {
      data[key] = schema.models[modelKey].fields[key].type
    }
  })

  return JSON.stringify(data, null, 2)
}

const CreateItem = ({ modelKey }) => {
  const [data, setData] = useState(genModel(modelKey))
  window.models = models
  window.DataStore = DataStore

  useEffect(() => {
    setData(genModel(modelKey))
  }, [modelKey])

  const create = async () => {
    const model = new models[modelKey](JSON.parse(data))
    await DataStore.save(model)
    setData(genModel(modelKey))
  }

  return (
    <div>
      <textarea value={data} onChange={evt => setData(evt.target.value)} />
      <button onClick={create}>Create</button>
    </div>
  )
}

const ListItem = ({ modelKey, item }) => {
  const [data, setData] = useState(JSON.stringify(item, null, 2))

  useEffect(() => {
    setData(JSON.stringify(item, null, 2))
  }, [item])

  const update = async () => {
    await DataStore.save(models[modelKey].copyOf(item, updated => {
      Object.entries(JSON.parse(data)).forEach(([key, value]) => {
        updated[key] = value
      })
    }))
  }

  const _delete = async () => {
    await DataStore.delete(item)
  }

  return (
    <li>
      <textarea value={data} onChange={evt => setData(evt.target.value)} />
      <button onClick={update}>Update</button>
      <button onClick={_delete}>Delete</button>
    </li>
  )
}

const ShowModel = ({ modelKey }) => {
  const [data, setData] = useState([])
  const [count, setCount] = useState(0)

  const reload = useCallback(async () => {
    const newData = await DataStore.query(models[modelKey])
    setData(newData)
    setCount(i => i + 1)
  }, [modelKey])

  // Subscribe to changes and load data at mounting
  useEffect(() => {
    reload()

    const subscription = DataStore.observe(models[modelKey]).subscribe((...args) => {
      console.info(`[${modelKey}] Just receivve update`, ...args)
      reload()
    })

    return () => subscription.unsubscribe()
  }, [modelKey, reload])

  return (
    <div className='modelColumn'>
      <h2>{modelKey}s</h2>
      <h6>Data reloaded {count} times</h6>
      <button onClick={reload}>Reload</button>
      <hr />
      <CreateItem modelKey={modelKey} />
      <hr />
      <ul>
        {
          data.map(item => (
            <ListItem
              key={item.id}
              item={item}
              modelKey={modelKey}
            />
          ))
        }
      </ul>
    </div>
  )
}

const modelKeys = Object.keys(schema.models)
const App = () => (
  <div className="App">
    <header className="App-header">
      <button onClick={() => {
        DataStore.clear()
        window.location.reload()
      }}>Flush store</button>
      <div className='models'>
        {modelKeys.map(modelKey => (
          <ShowModel key={modelKey} modelKey={modelKey} />
        ))}
      </div>
    </header>
  </div>
)

export default withAuthenticator(App)
