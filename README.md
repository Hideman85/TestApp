# Test app using AWS AppSync & DataStorage

## GraphQL schema
[schema.graphql](schema.graphql)

Issues:
- No support of Union (nor possibilities to manage IDs ourself)
- Connections cause issues
- @auth not enough for user management system
- Frontend issue, the first try with DataStore come to an infinite loop

[Investigations & Tries:](#investigations--tries)
- Creating a @CustomAuth a directive with a custom GrapQL transformer for AmplifyCLI

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
? Provide your schema file path: schema.graphql

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
- Click on "Create comment"

```
Error saving comment InternalError: "too much recursion"
    isGraphQLScalarType types.ts:126
    result utils.ts:82
    getScalarFields utils.ts:80
    generateSelectionSet utils.ts:57
    getNonModelFields utils.ts:143
    getNonModelFields utils.ts:137
    getNonModelFields utils.ts:129
    generateSelectionSet utils.ts:58
    getNonModelFields utils.ts:143
    getNonModelFields utils.ts:137
    getNonModelFields utils.ts:129
    generateSelectionSet utils.ts:58
```

## Cleanup `amplify delete`

# Investigations & Tries
## Custom GraphQL transformer for @CustomAuth
Started the implementation of a custom transformer for applying additional transformations for our role checking for authorizing a actions.

The code can be found there: https://github.com/Hideman85/amplify-cli/tree/master/packages/graphql-customauth-transformer

No need to build the whole amplify-cli because the actual implementation already support the addition of custom transformer (even if it's not really documented but by looking in the code we can found it).

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
        "/absolute/path/to/amplify-cli/packages/graphql-customauth-transformer/lib/ModelCustomAuthTransformer"
    ]
}
```

### Using the new directive @CustomAuth

```gql
type Comment
@model
@CustomAuth(rules: [{
  action: CREATE,
  kind: ORGANISATION_ROLE,
  allowedRoles: [ORGANISATION_CREATING_ACCESS, ORGANISATION_ADMIN_ACCESS]
}])
@key(name: "byInstanceID", fields: ["instanceID", "organisationID"])
{
  # ...
}
```

### Run `amplify api gql-compile` to see changes

# Open questions

Linked issue: https://github.com/aws-amplify/amplify-cli/issues/5119

- How to efficiently return only items that the user has access to for a list & sync queries?
  - Fetching the table (scan) and filtering out the non access item is inefficient (currently made with the actual @auth)
  - Maybe using BatchGetItem?
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
  - More tricky stuff, all generated nested stacks need to dependsOn the stack CommonPipelineFunctions but it looks like the stacks doe not exist yet even in the `after(ctx: TransformerContext)` of the GraphQL transformer
