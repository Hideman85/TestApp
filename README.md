# Test app using AWS AppSync & DataStorage

## GraphQL schema
[schemaWithCustomAuth.graphql](schemaWithCustomAuth.graphql)

Issues:
- No support of Union (nor possibilities to manage IDs ourself)
- Connections cause issues (and probably not needed because resolved in backend and not in frontend by DataStore)
- @auth not enough for user management system
- DeltaSync Query + Subscriptions work only on the whole table
- And basically what you can find on the repos opened by me
  - https://github.com/aws-amplify/amplify-cli/issues/created_by/Hideman85
  - https://github.com/aws-amplify/amplify-js/issues/created_by/Hideman85
- There is my [Investigations & Tries](#investigations--tries)

## Adding API
### `amplify init`
```
Event handler PreInit to be implemented.
Note: It is recommended to run this command from the root of your app directory
? Enter a name for the project testapp
? Enter a name for the environment dev
? Choose your default editor: IntelliJ IDEA
? Choose the type of app that you're building javascript
Please tell us about your project
? What javascript framework are you using react
? Source Directory Path:  src
? Distribution Directory Path: build
? Build Command:  npm run-script build
? Start Command: npm run-script start
Using default provider  awscloudformation

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-multiple-profiles.html

? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use default
Adding backend environment dev to AWS Amplify Console app:
```

### `amplify add auth`
```
Using service: Cognito, provided by: awscloudformation
 
 The current configured provider is Amazon Cognito. 
 
 Do you want to use the default authentication and security configuration? Default configuration
 Warning: you will not be able to edit these selections. 
 How do you want users to be able to sign in? Username
 Do you want to configure advanced settings? No, I am done.
```

### `amplify add api`
```
? Please select from one of the below mentioned services: GraphQL
? Provide API name: testapp
? Choose the default authorization type for the API Amazon Cognito User Pool
Use a Cognito user pool configured as a part of this project.
? Do you want to configure advanced settings for the GraphQL API Yes, I want to make some additional changes.
? Configure additional auth types? Yes
? Choose the additional authorization types you want to configure for the API? API Key
? Configure conflict detection? Yes
? Select the default resolution strategy Auto Merge
? Do you have an annotated GraphQL schema? Yes
? Provide your schema file path: schemaWithCustomAuth.graphql

- schema.graphql contains basic data structure without any authorization restriction
- schemaWithCustomAuth.graphql contains also custom GraphQL directives and tranformers

The following types do not have '@auth' enabled. Consider using @auth with @model
         - User
         - Team
         - Organisation
         - OrganisationRole
         - InputField
         - Conditional
         - SectionDelta
         - SectionText
         - SectionFile
         - Template
         - Contract
         - InstanceRole
         - Comment
Learn more about @auth here: https://docs.amplify.aws/cli/graphql-transformer/directives#auth


GraphQL schema compiled successfully.
```

### `amplify push`
```
...
Deployed
```

## Frontend

- `npm i`
- `npm run start`
- Creating a user
- Login in
- Play around

Issues:
- DataStore failed to handle models with hash and range key as primary key [#6730](https://github.com/aws-amplify/amplify-js/issues/6730)
- DataStore failed to handle recursive models like tree [#6736](https://github.com/aws-amplify/amplify-js/issues/6736)
- DataStore failed to handle optional attributes [#6744](https://github.com/aws-amplify/amplify-js/issues/6744)
- DataStore should automatically fill createdAt and updatedAt [#6758](https://github.com/aws-amplify/amplify-js/issues/6758)
- DataStore should handle empty string in frontend before calling backend [#6759](https://github.com/aws-amplify/amplify-js/issues/6759)

## Cleanup `amplify delete`

# Investigations & Tries
## Custom GraphQL transformer for @CustomAuth
Started the implementation of a custom transformer for applying additional transformations for our role checking for authorizing a actions.

The code can be found there: https://github.com/Hideman85/amplify-cli/tree/master/packages/graphql-customauth-transformer

### Enabling the custom transformer
After cloning and compiling the transformer we just need to add one config in the file `amplify/backend/api/testapp/transform.conf.json`:

```js
{
    "Version": 5,
    "ElasticsearchWarning": true,
    "ResolverConfig": {
        "project": {
            "ConflictHandler": "AUTOMERGE",
            "ConflictDetection": "VERSION"
        }
    },
    //  Added stuff
    "transformers": [
        "/absolute/path/to/amplify-cli/packages/graphql-customauth-transformer/lib/SetTransformer",
        "/absolute/path/to/amplify-cli/packages/graphql-customauth-transformer/lib/CheckTransformer",
        "/absolute/path/to/amplify-cli/packages/graphql-customauth-transformer/lib/ReadOnlyTransformer",
        "/absolute/path/to/amplify-cli/packages/graphql-customauth-transformer/lib/ModelCustomAuthTransformer"
    ]
}
```

### Using the new directives @CustomAuth, @ReadOnly, @Set and @Check

```gql
type Comment
@model
@CustomAuth(rules: [{
  actions: [CREATE],
  kind: INSTANCE_ROLE,
  allowedRoles: [COMMENTING_ACCESS, EDITING_ACCESS, ADMIN_ACCESS]
  instanceField: "instanceID"
}, {
  actions: [UPDATE, DELETE],
  kind: INSTANCE_ROLE,
  allowedRoles: [ADMIN_ACCESS]
  instanceField: "instanceID"
}, {
  actions: [GET, LIST, SUBSCRIPTION]
  kind: INSTANCE_ROLE,
  allowedRoles: [VIEWING_ACCESS, COMMENTING_ACCESS, EDITING_ACCESS, ADMIN_ACCESS]
  instanceField: "instanceID"
}])
@key(name: "byInstanceID", fields: ["instanceID", "organisationID"])
{
  id: ID! # comment-
  userID: ID! @ReadOnly @Set(value: "$ctx.identity.sub")
  # user: User! @connection(fields: ["userID"])
  instanceID: ID! @ReadOnly
  # instance: CommentInstance! @connection(fields: ["instanceID"])
  # organisationID used for distinguish inter and external comments
  organisationID: ID @ReadOnly @Check(values: ["$ctx.identity.claims[\"custom:currentOrganisation\"]", "null"])
  # organisation: Organisation @connection(fields: ["organisationID"])
  text: String!
}
```

### Run `amplify api gql-compile` to see changes

### Deployment
For deploying we need our changes made on [amplify-cli](https://github.com/Hideman85/amplify-cli)

- Build `amplify-cli` in the cloned directory run `yarn setup-dev`
- After amplify was built we have `amplify-dev` command available make sure `yarn global bin` is in your PATH variable to able to find the new command
- Make sure to change the config [above](#using-the-new-directives-customAuth-readonly-set-and-check) with the correct absolute path to `amplify-cli`
- Now on this repo directory you can run `amplify-dev push`

# Open questions

Linked issue: https://github.com/aws-amplify/amplify-cli/issues/5119

- How to efficiently return only items that the user has access to for a list & sync queries?
  - Fetching the table (scan) and filtering out the non access item is inefficient (currently made with the actual @auth)
  - Maybe using BatchGetItem?
  - For the list query I use a combination of Query on index and BatchGet for having only items

- How to manage subscriptions correctly (with no security issues)?
  it can be a bit tricky for example:
    
  > You have already sync a ObjectA because you have Read access. Now the owner do the update to remove your access.
  > 
  > The consequences would be:
  > 
  > - For all user that have still access to the document they should get the information that a user access has been removed
  > - The user that just be denied should get the information remove from your store the ObjectA and attached roles
  > - And of course that information should not be sent to other subscribers that don't have any access to that object

- How to get access to the API ID and the env inside mapping template for a building the generated table name for a BatchGetItem operation resolver?
  - [Doc about $ctx values](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-context-reference.html)
  - [Doc about BatchGetItem](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html#aws-appsync-resolver-mapping-template-reference-dynamodb-batch-get-item)
  - Table name:
    ```json
    "TableName": {
        "Fn::If": [
            "HasEnvironmentParameter",
            {
                "Fn::Join": [
                    "-",
                    [
                        "Comment",
                        {
                            "Ref": "GetAttGraphQLAPIApiId"
                        },
                        {
                            "Ref": "env"
                        }
                    ]
                ]
            },
            {
                "Fn::Join": [
                    "-",
                    [
                        "Comment",
                        {
                            "Ref": "GetAttGraphQLAPIApiId"
                        }
                    ]
                ]
            }
        ]
    },
    ```

- How to manage dependsOn with amplify-cli?
  - CREATE_FAILED AWS::AppSync::Resolver The specified functions must exist before referencing them from a resolver.
  - I need to dependsOn inside the same stack UserGetResolver need to dependsOn UserPipelineFunction resource
  ```js
  //  The resolver need to wait the creation of the pipeline function
  if (typeof resolver.DependsOn === 'string') {
    resolver.DependsOn = [resolver.DependsOn]
  } else if (!Array.isArray(resolver.DependsOn)) {
    resolver.DependsOn = []
  }
  resolver.DependsOn.push(pipelineFunctionID)
  ```
  - More tricky stuff, all generated nested stacks need to dependsOn the stack CommonPipelineFunctions but it looks like the stacks doe not exist yet even in the `after(ctx: TransformerContext)` of the GraphQL transformer
  -  **[Solved]** Addition in the CLI of a step `stack(...)` to able transformer to modify nested stacks

- What about DynamoDB streams + Custom WebSocket API for subscriptions?
  
  I was wondering if we can find a workaround with the combination of the WebSocket API and DynamoDB streams. My though was to replace the current WebSocket endpoint (that target AppSync service) to a WebSocket API and having a lambda that listening changes on all tables (through streams) to send the change to only the connected clients that have access to.
